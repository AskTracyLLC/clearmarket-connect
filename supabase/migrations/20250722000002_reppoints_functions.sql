-- RepPoints Management Functions
-- Handles earning and spending RepPoints separately from ClearCredits

-- Function to award RepPoints (replaces existing credit earning)
CREATE OR REPLACE FUNCTION public.award_rep_points(
  target_user_id UUID,
  points_amount NUMERIC,
  rule_name_param TEXT,
  reference_id_param UUID DEFAULT NULL,
  reference_type_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rule_record RECORD;
  daily_limit_reached BOOLEAN := false;
  max_per_day NUMERIC;
BEGIN
  -- Get the credit earning rule
  SELECT * INTO rule_record
  FROM public.credit_earning_rules
  WHERE rule_name = rule_name_param AND is_enabled = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check daily limits if applicable
  IF rule_record.max_per_day IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) >= rule_record.max_per_day INTO daily_limit_reached
    FROM public.credit_transactions
    WHERE user_id = target_user_id
      AND currency_type = 'rep_points'
      AND reference_type = reference_type_param
      AND DATE(created_at) = CURRENT_DATE;
      
    IF daily_limit_reached THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Record the RepPoints transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, currency_type,
    reference_id, reference_type, metadata
  ) VALUES (
    target_user_id, points_amount, 'earned', 'rep_points',
    reference_id_param, reference_type_param, metadata_param
  );
  
  -- Update user's RepPoints balance
  UPDATE public.credits
  SET 
    rep_points = COALESCE(rep_points, 0) + points_amount,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Insert initial record if user doesn't exist in credits table
  INSERT INTO public.credits (user_id, rep_points, current_balance, earned_credits)
  VALUES (target_user_id, points_amount, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update trust score
  PERFORM public.update_trust_score(target_user_id);
  
  RETURN true;
END;
$$;

-- Function to spend RepPoints on giveaway entries
CREATE OR REPLACE FUNCTION public.spend_rep_points(
  spender_user_id UUID,
  points_amount NUMERIC,
  giveaway_id_param UUID,
  giveaway_type_param TEXT, -- 'monthly' or 'vendor_network'
  entry_count_param INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_rep_points NUMERIC;
  giveaway_active BOOLEAN := false;
  network_eligible BOOLEAN := false;
  existing_entries INTEGER := 0;
  max_entries INTEGER;
BEGIN
  -- Check current RepPoints balance
  SELECT COALESCE(rep_points, 0) INTO current_rep_points
  FROM public.credits
  WHERE user_id = spender_user_id;
  
  IF current_rep_points < points_amount THEN
    RETURN false;
  END IF;
  
  -- Validate giveaway and eligibility
  IF giveaway_type_param = 'monthly' THEN
    SELECT (status = 'active') INTO giveaway_active
    FROM public.monthly_giveaways
    WHERE id = giveaway_id_param;
    
    IF NOT giveaway_active THEN
      RETURN false;
    END IF;
    
    -- Check existing entries
    SELECT COALESCE(entry_count, 0) INTO existing_entries
    FROM public.giveaway_entries
    WHERE giveaway_id = giveaway_id_param AND user_id = spender_user_id;
    
  ELSIF giveaway_type_param = 'vendor_network' THEN
    SELECT 
      (status = 'active'),
      COALESCE(max_entries_per_user, 999)
    INTO giveaway_active, max_entries
    FROM public.vendor_network_giveaways
    WHERE id = giveaway_id_param;
    
    IF NOT giveaway_active THEN
      RETURN false;
    END IF;
    
    -- Check network eligibility
    SELECT EXISTS (
      SELECT 1 FROM public.vendor_network_giveaways vng
      JOIN public.contact_unlocks cu ON (
        (cu.unlocker_id = spender_user_id AND cu.unlocked_user_id = vng.vendor_id)
        OR (cu.unlocked_user_id = spender_user_id AND cu.unlocker_id = vng.vendor_id)
      )
      WHERE vng.id = giveaway_id_param
    ) INTO network_eligible;
    
    IF NOT network_eligible THEN
      RETURN false;
    END IF;
    
    -- Check existing entries and max limit
    SELECT COALESCE(entry_count, 0) INTO existing_entries
    FROM public.vendor_giveaway_entries
    WHERE giveaway_id = giveaway_id_param AND user_id = spender_user_id;
    
    IF existing_entries + entry_count_param > max_entries THEN
      RETURN false;
    END IF;
    
  ELSE
    RETURN false;
  END IF;
  
  -- Record the RepPoints spending transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, currency_type,
    reference_id, reference_type, metadata
  ) VALUES (
    spender_user_id, -points_amount, 'spent', 'rep_points',
    giveaway_id_param, giveaway_type_param, 
    jsonb_build_object('entry_count', entry_count_param)
  );
  
  -- Update RepPoints balance
  UPDATE public.credits
  SET 
    rep_points = rep_points - points_amount,
    updated_at = now()
  WHERE user_id = spender_user_id;
  
  -- Insert or update giveaway entry
  IF giveaway_type_param = 'monthly' THEN
    INSERT INTO public.giveaway_entries (giveaway_id, user_id, entry_count, rep_points_spent)
    VALUES (giveaway_id_param, spender_user_id, entry_count_param, points_amount)
    ON CONFLICT (giveaway_id, user_id)
    DO UPDATE SET
      entry_count = giveaway_entries.entry_count + entry_count_param,
      rep_points_spent = giveaway_entries.rep_points_spent + points_amount;
      
    -- Update total entries count
    UPDATE public.monthly_giveaways
    SET total_entries = total_entries + entry_count_param
    WHERE id = giveaway_id_param;
    
  ELSIF giveaway_type_param = 'vendor_network' THEN
    INSERT INTO public.vendor_giveaway_entries (giveaway_id, user_id, entry_count, rep_points_spent)
    VALUES (giveaway_id_param, spender_user_id, entry_count_param, points_amount)
    ON CONFLICT (giveaway_id, user_id)
    DO UPDATE SET
      entry_count = vendor_giveaway_entries.entry_count + entry_count_param,
      rep_points_spent = vendor_giveaway_entries.rep_points_spent + points_amount;
      
    -- Update total entries count
    UPDATE public.vendor_network_giveaways
    SET total_entries = total_entries + entry_count_param
    WHERE id = giveaway_id_param;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to get user's giveaway eligibility
CREATE OR REPLACE FUNCTION public.get_giveaway_eligibility(
  user_id_param UUID,
  giveaway_id_param UUID,
  giveaway_type_param TEXT
)
RETURNS TABLE (
  eligible BOOLEAN,
  reason TEXT,
  current_entries INTEGER,
  max_entries INTEGER,
  rep_points_balance INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get user's current RepPoints
  SELECT COALESCE(c.rep_points, 0) INTO rep_points_balance
  FROM public.credits c
  WHERE c.user_id = user_id_param;
  
  IF giveaway_type_param = 'monthly' THEN
    -- Check if giveaway is active
    IF NOT EXISTS (
      SELECT 1 FROM public.monthly_giveaways 
      WHERE id = giveaway_id_param AND status = 'active'
    ) THEN
      eligible := false;
      reason := 'Giveaway not active';
      current_entries := 0;
      max_entries := 0;
      RETURN NEXT;
      RETURN;
    END IF;
    
    -- Get current entries
    SELECT COALESCE(ge.entry_count, 0) INTO current_entries
    FROM public.giveaway_entries ge
    WHERE ge.giveaway_id = giveaway_id_param AND ge.user_id = user_id_param;
    
    max_entries := 999; -- No limit for monthly giveaways
    eligible := true;
    reason := 'Eligible';
    
  ELSIF giveaway_type_param = 'vendor_network' THEN
    -- Check if giveaway is active and user is in network
    SELECT 
      CASE 
        WHEN vng.status != 'active' THEN false
        WHEN NOT EXISTS (
          SELECT 1 FROM public.contact_unlocks cu 
          WHERE (cu.unlocker_id = user_id_param AND cu.unlocked_user_id = vng.vendor_id)
             OR (cu.unlocked_user_id = user_id_param AND cu.unlocker_id = vng.vendor_id)
        ) THEN false
        ELSE true
      END,
      CASE 
        WHEN vng.status != 'active' THEN 'Giveaway not active'
        WHEN NOT EXISTS (
          SELECT 1 FROM public.contact_unlocks cu 
          WHERE (cu.unlocker_id = user_id_param AND cu.unlocked_user_id = vng.vendor_id)
             OR (cu.unlocked_user_id = user_id_param AND cu.unlocker_id = vng.vendor_id)
        ) THEN 'Not in vendor network'
        ELSE 'Eligible'
      END,
      COALESCE(vng.max_entries_per_user, 999)
    INTO eligible, reason, max_entries
    FROM public.vendor_network_giveaways vng
    WHERE vng.id = giveaway_id_param;
    
    -- Get current entries
    SELECT COALESCE(vge.entry_count, 0) INTO current_entries
    FROM public.vendor_giveaway_entries vge
    WHERE vge.giveaway_id = giveaway_id_param AND vge.user_id = user_id_param;
    
    -- Check if max entries reached
    IF current_entries >= max_entries THEN
      eligible := false;
      reason := 'Maximum entries reached';
    END IF;
    
  ELSE
    eligible := false;
    reason := 'Invalid giveaway type';
    current_entries := 0;
    max_entries := 0;
  END IF;
  
  RETURN NEXT;
END;
$$;
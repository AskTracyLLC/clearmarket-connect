-- Update existing credit earning functions to award RepPoints instead
-- This replaces the existing award_credits function calls

-- Replace the existing award_credits function to use RepPoints
CREATE OR REPLACE FUNCTION public.award_credits(
  target_user_id UUID,
  credit_amount NUMERIC,
  rule_name_param TEXT,
  reference_id_param UUID DEFAULT NULL,
  reference_type_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Redirect to RepPoints function
  RETURN public.award_rep_points(
    target_user_id,
    credit_amount,
    rule_name_param,
    reference_id_param,
    reference_type_param,
    metadata_param
  );
END;
$$;

-- Update credit spending function to only handle ClearCredits
CREATE OR REPLACE FUNCTION public.spend_clear_credits(
  spender_user_id UUID,
  amount_param NUMERIC,
  reference_id_param UUID DEFAULT NULL,
  reference_type_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Check current ClearCredits balance
  SELECT COALESCE(current_balance, 0) INTO current_balance
  FROM public.credits
  WHERE user_id = spender_user_id;
  
  -- Check if user has enough ClearCredits
  IF current_balance < amount_param THEN
    RETURN false;
  END IF;
  
  -- Record the transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, currency_type,
    reference_id, reference_type, metadata
  ) VALUES (
    spender_user_id, -amount_param, 'spent', 'clear_credits',
    reference_id_param, reference_type_param, metadata_param
  );
  
  -- Update balance
  UPDATE public.credits
  SET 
    current_balance = current_balance - amount_param,
    updated_at = now()
  WHERE user_id = spender_user_id;
  
  RETURN true;
END;
$$;

-- Create function to add ClearCredits (from purchases)
CREATE OR REPLACE FUNCTION public.add_clear_credits(
  target_user_id UUID,
  credit_amount NUMERIC,
  reference_id_param UUID DEFAULT NULL,
  reference_type_param TEXT DEFAULT 'purchase',
  metadata_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Record the transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, currency_type,
    reference_id, reference_type, metadata
  ) VALUES (
    target_user_id, credit_amount, 'purchased', 'clear_credits',
    reference_id_param, reference_type_param, metadata_param
  );
  
  -- Update user's ClearCredits balance
  UPDATE public.credits
  SET 
    current_balance = COALESCE(current_balance, 0) + credit_amount,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Insert initial record if user doesn't exist in credits table
  INSERT INTO public.credits (user_id, current_balance, earned_credits, rep_points)
  VALUES (target_user_id, credit_amount, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Create view for easy dual balance queries
CREATE OR REPLACE VIEW public.user_balances AS
SELECT 
  c.user_id,
  COALESCE(c.rep_points, 0) as rep_points,
  COALESCE(c.current_balance, 0) as clear_credits,
  COALESCE(c.earned_credits, 0) as total_earned_credits, -- Historical tracking
  c.updated_at
FROM public.credits c;

-- Enable RLS on the view
ALTER VIEW public.user_balances SET (security_invoker = true);

-- Create policy for user_balances view
CREATE POLICY "Users can view own balances" 
ON public.credits
FOR SELECT 
USING (auth.uid() = user_id);

-- Update existing spend_credits function to use ClearCredits
CREATE OR REPLACE FUNCTION public.spend_credits(
  spender_user_id UUID,
  amount_param NUMERIC,
  reference_id_param UUID DEFAULT NULL,
  reference_type_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Redirect to ClearCredits function
  RETURN public.spend_clear_credits(
    spender_user_id,
    amount_param,
    reference_id_param,
    reference_type_param,
    metadata_param
  );
END;
$$;
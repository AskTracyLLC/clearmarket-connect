-- Create credit transaction log table
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.credit_earning_rules(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'purchased', 'refunded')),
  reference_id UUID, -- ID of the related action (post, unlock, etc.)
  reference_type TEXT, -- Type of reference (post, unlock, review, etc.)
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create helpful votes tracking table to prevent abuse
CREATE TABLE public.helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- post_id or comment_id
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(voter_id, target_id, target_type)
);

-- Create daily credit earnings tracking table
CREATE TABLE public.daily_credit_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.credit_earning_rules(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  times_earned INTEGER NOT NULL DEFAULT 0,
  total_credits NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(user_id, rule_id, date)
);

-- Create reviews table for trust score calculation
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  work_completed_date DATE,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_user_id) -- One review per pair
);

-- Enable RLS on new tables
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_credit_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_transactions
CREATE POLICY "Users can view own credit transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all credit transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create policies for helpful_votes
CREATE POLICY "Users can view own helpful votes" 
ON public.helpful_votes 
FOR SELECT 
USING (auth.uid() = voter_id);

CREATE POLICY "Users can create helpful votes" 
ON public.helpful_votes 
FOR INSERT 
WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can delete own helpful votes" 
ON public.helpful_votes 
FOR DELETE 
USING (auth.uid() = voter_id);

-- Create policies for daily_credit_earnings
CREATE POLICY "Users can view own daily earnings" 
ON public.daily_credit_earnings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert daily earnings" 
ON public.daily_credit_earnings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update daily earnings" 
ON public.daily_credit_earnings 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all daily earnings" 
ON public.daily_credit_earnings 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create policies for reviews
CREATE POLICY "Everyone can view verified reviews" 
ON public.reviews 
FOR SELECT 
USING (verified = true);

CREATE POLICY "Users can create reviews for network connections" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.contact_unlocks 
    WHERE (
      (unlocker_id = auth.uid() AND unlocked_user_id = reviewed_user_id) OR
      (unlocked_user_id = auth.uid() AND unlocker_id = reviewed_user_id)
    )
  )
);

CREATE POLICY "Users can update own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Moderators can verify reviews" 
ON public.reviews 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['moderator'::user_role, 'admin'::user_role]));

-- Create indexes for performance
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_helpful_votes_voter_target ON public.helpful_votes(voter_id, target_id, target_type);
CREATE INDEX idx_daily_credit_earnings_user_date ON public.daily_credit_earnings(user_id, date);
CREATE INDEX idx_reviews_reviewed_user ON public.reviews(reviewed_user_id, verified);

-- Create function to update trust score
CREATE OR REPLACE FUNCTION public.update_trust_score(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  review_score NUMERIC := 0;
  profile_score NUMERIC := 0;
  community_score NUMERIC := 0;
  total_score INTEGER := 0;
BEGIN
  -- Calculate review score (0-50 points)
  SELECT COALESCE(AVG(rating) * 10, 0) 
  INTO review_score
  FROM public.reviews 
  WHERE reviewed_user_id = target_user_id AND verified = true;
  
  -- Calculate profile completeness score (0-25 points)
  SELECT COALESCE(profile_complete * 0.25, 0)
  INTO profile_score
  FROM public.users 
  WHERE id = target_user_id;
  
  -- Calculate community participation score (0-25 points)
  SELECT COALESCE(
    (
      (SELECT COUNT(*) FROM public.community_posts WHERE user_id = target_user_id) +
      (SELECT COUNT(*) FROM public.community_comments WHERE user_id = target_user_id) +
      (SELECT COALESCE(SUM(amount), 0) FROM public.credit_transactions WHERE user_id = target_user_id AND transaction_type = 'earned')
    ) * 0.5, 0
  )
  INTO community_score;
  
  -- Cap community score at 25
  community_score := LEAST(community_score, 25);
  
  -- Calculate total (max 100)
  total_score := LEAST(ROUND(review_score + profile_score + community_score), 100);
  
  -- Update user's trust score
  UPDATE public.users 
  SET trust_score = total_score, updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Create function to award credits
CREATE OR REPLACE FUNCTION public.award_credits(
  target_user_id UUID,
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
  daily_record RECORD;
  credit_amount NUMERIC;
  can_award BOOLEAN := false;
BEGIN
  -- Get the credit rule
  SELECT * INTO rule_record
  FROM public.credit_earning_rules
  WHERE rule_name = rule_name_param AND is_enabled = true;
  
  IF rule_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check daily limit if applicable
  IF rule_record.daily_limit IS NOT NULL THEN
    SELECT * INTO daily_record
    FROM public.daily_credit_earnings
    WHERE user_id = target_user_id 
    AND rule_id = rule_record.id 
    AND date = CURRENT_DATE;
    
    IF daily_record IS NULL THEN
      can_award := true;
    ELSIF daily_record.times_earned < rule_record.daily_limit THEN
      can_award := true;
    END IF;
  ELSE
    can_award := true;
  END IF;
  
  -- Award credits if eligible
  IF can_award THEN
    credit_amount := rule_record.credit_amount;
    
    -- Insert credit transaction
    INSERT INTO public.credit_transactions (
      user_id, rule_id, amount, transaction_type, 
      reference_id, reference_type, metadata
    ) VALUES (
      target_user_id, rule_record.id, credit_amount, 'earned',
      reference_id_param, reference_type_param, metadata_param
    );
    
    -- Update user's credit balance
    UPDATE public.credits
    SET 
      earned_credits = COALESCE(earned_credits, 0) + credit_amount,
      current_balance = COALESCE(current_balance, 0) + credit_amount,
      updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Update or insert daily tracking
    INSERT INTO public.daily_credit_earnings (user_id, rule_id, date, times_earned, total_credits)
    VALUES (target_user_id, rule_record.id, CURRENT_DATE, 1, credit_amount)
    ON CONFLICT (user_id, rule_id, date)
    DO UPDATE SET
      times_earned = daily_credit_earnings.times_earned + 1,
      total_credits = daily_credit_earnings.total_credits + credit_amount;
    
    -- Update trust score
    PERFORM public.update_trust_score(target_user_id);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create function to spend credits
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
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Check current balance
  SELECT COALESCE(current_balance, 0) INTO current_balance
  FROM public.credits
  WHERE user_id = spender_user_id;
  
  -- Check if user has enough credits
  IF current_balance < amount_param THEN
    RETURN false;
  END IF;
  
  -- Record the transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, 
    reference_id, reference_type, metadata
  ) VALUES (
    spender_user_id, -amount_param, 'spent',
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
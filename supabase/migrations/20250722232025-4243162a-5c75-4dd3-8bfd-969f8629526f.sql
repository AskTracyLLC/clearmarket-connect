
-- Create enums for prize and token types
CREATE TYPE public.prize_type AS ENUM ('gift_card', 'boost_token', 'bad_day_token', 'bundle');
CREATE TYPE public.token_type AS ENUM ('bad_day', 'boost', 'review_spotlight');

-- Create giveaway_prizes table for standardized prize definitions
CREATE TABLE public.giveaway_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prize_type public.prize_type NOT NULL,
  credit_value INTEGER NULL,
  description TEXT NOT NULL,
  cooldown_days INTEGER NULL,
  max_active INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_tokens table to track active tokens per user
CREATE TABLE public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_type public.token_type NOT NULL,
  review_id UUID NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cooldown_expires_at TIMESTAMP WITH TIME ZONE NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hidden_reviews table to track reviews hidden by Bad Day tokens
CREATE TABLE public.hidden_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL,
  token_id UUID NOT NULL REFERENCES public.user_tokens(id),
  hidden_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  admin_override BOOLEAN DEFAULT false,
  admin_user_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.giveaway_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for giveaway_prizes
CREATE POLICY "Anyone can view active prizes" ON public.giveaway_prizes
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all prizes" ON public.giveaway_prizes
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for user_tokens
CREATE POLICY "Users can view own tokens" ON public.user_tokens
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tokens" ON public.user_tokens
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tokens" ON public.user_tokens
FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can manage tokens" ON public.user_tokens
FOR ALL USING (true);

-- RLS policies for hidden_reviews
CREATE POLICY "Users can view own hidden reviews" ON public.hidden_reviews
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all hidden reviews" ON public.hidden_reviews
FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can manage hidden reviews" ON public.hidden_reviews
FOR ALL USING (true);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_giveaway_prizes_updated_at
BEFORE UPDATE ON public.giveaway_prizes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default prize types
INSERT INTO public.giveaway_prizes (name, prize_type, credit_value, description, cooldown_days, max_active) VALUES
('$50 Amazon Gift Card', 'gift_card', 50, 'A $50 Amazon gift card that can be used for any purchase on Amazon.com', NULL, 1),
('$100 Amazon Gift Card', 'gift_card', 100, 'A $100 Amazon gift card that can be used for any purchase on Amazon.com', NULL, 1),
('$500 Amazon Gift Card', 'gift_card', 500, 'A $500 Amazon gift card that can be used for any purchase on Amazon.com', NULL, 1),
('Profile Boost Token', 'boost_token', 5, '7-day profile visibility boost to increase your chances of being contacted by vendors', NULL, 3),
('Bad Day Token', 'bad_day_token', 15, 'Temporarily hide one negative review from your public profile for 30 days. Helps you focus on improvement while maintaining transparency.', 30, 1);

-- Create function to check if user can use Bad Day token
CREATE OR REPLACE FUNCTION public.can_use_bad_day_token(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_tokens INTEGER;
  cooldown_active BOOLEAN;
BEGIN
  -- Check for active Bad Day tokens
  SELECT COUNT(*) INTO active_tokens
  FROM public.user_tokens
  WHERE user_id = target_user_id 
    AND token_type = 'bad_day'
    AND is_active = true
    AND expires_at > now();
  
  -- Check for active cooldown
  SELECT EXISTS (
    SELECT 1 FROM public.user_tokens
    WHERE user_id = target_user_id
      AND token_type = 'bad_day' 
      AND cooldown_expires_at > now()
  ) INTO cooldown_active;
  
  RETURN (active_tokens = 0 AND NOT cooldown_active);
END;
$$;

-- Create function to use Bad Day token
CREATE OR REPLACE FUNCTION public.use_bad_day_token(
  target_user_id UUID,
  target_review_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_id UUID;
  expires_date TIMESTAMP WITH TIME ZONE;
  cooldown_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user can use token
  IF NOT public.can_use_bad_day_token(target_user_id) THEN
    RETURN false;
  END IF;
  
  -- Set expiration dates
  expires_date := now() + interval '30 days';
  cooldown_date := now() + interval '30 days';
  
  -- Create the token record
  INSERT INTO public.user_tokens (
    user_id, token_type, review_id, expires_at, cooldown_expires_at
  ) VALUES (
    target_user_id, 'bad_day', target_review_id, expires_date, cooldown_date
  ) RETURNING id INTO token_id;
  
  -- Create the hidden review record
  INSERT INTO public.hidden_reviews (
    user_id, review_id, token_id, expires_at
  ) VALUES (
    target_user_id, target_review_id, token_id, expires_date
  );
  
  RETURN true;
END;
$$;

-- Create view for active hidden reviews (for public profile filtering)
CREATE VIEW public.active_hidden_reviews AS
SELECT 
  hr.user_id,
  hr.review_id,
  hr.expires_at,
  hr.admin_override
FROM public.hidden_reviews hr
WHERE hr.expires_at > now() 
  AND hr.admin_override = false;

-- Enable RLS on the view
ALTER VIEW public.active_hidden_reviews SET (security_invoker = true);

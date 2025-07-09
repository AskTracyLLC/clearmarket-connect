-- Add boost functionality to users table
ALTER TABLE public.users ADD COLUMN boost_expiration TIMESTAMPTZ NULL;

-- Create sent_emails table for email notification logging
CREATE TABLE public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NULL
);

-- Enable RLS on sent_emails
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for sent_emails
CREATE POLICY "Users can view own sent emails" ON public.sent_emails
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sent emails" ON public.sent_emails
FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert sent emails" ON public.sent_emails
FOR INSERT WITH CHECK (true);

-- Create boost settings in credit_earning_rules (reusing existing admin system)
INSERT INTO public.credit_earning_rules (
  rule_name,
  rule_description,
  credit_amount,
  is_enabled,
  internal_notes
) VALUES 
(
  'boost_cost',
  'Cost in credits to boost profile for 7 days',
  -5,
  true,
  'Negative amount represents cost. Duration is 7 days from boost activation.'
);

-- Create index for boost queries
CREATE INDEX idx_users_boost_expiration ON public.users(boost_expiration) WHERE boost_expiration IS NOT NULL;

-- Create index for email logging
CREATE INDEX idx_sent_emails_user_type ON public.sent_emails(user_id, email_type);
CREATE INDEX idx_sent_emails_sent_at ON public.sent_emails(sent_at);
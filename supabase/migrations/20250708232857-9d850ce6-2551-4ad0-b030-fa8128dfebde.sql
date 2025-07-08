-- Create credit earning rules table
CREATE TABLE public.credit_earning_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  credit_amount DECIMAL NOT NULL DEFAULT 0,
  daily_limit INTEGER NULL,
  cooldown_hours INTEGER NULL,
  max_per_target INTEGER NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  requires_verification BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit earning audit log table
CREATE TABLE public.credit_earning_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  before_values JSONB NULL,
  after_values JSONB NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credit_earning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_earning_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credit_earning_rules
CREATE POLICY "Admins can view all credit rules" 
ON public.credit_earning_rules 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert credit rules" 
ON public.credit_earning_rules 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update credit rules" 
ON public.credit_earning_rules 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete credit rules" 
ON public.credit_earning_rules 
FOR DELETE 
USING (get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for credit_earning_audit_log
CREATE POLICY "Admins can view all audit logs" 
ON public.credit_earning_audit_log 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert audit logs" 
ON public.credit_earning_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.credit_earning_audit_log 
ADD CONSTRAINT credit_earning_audit_log_rule_id_fkey 
FOREIGN KEY (rule_id) REFERENCES public.credit_earning_rules(id);

ALTER TABLE public.credit_earning_audit_log 
ADD CONSTRAINT credit_earning_audit_log_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES public.users(id);

-- Create trigger for updated_at
CREATE TRIGGER update_credit_earning_rules_updated_at
BEFORE UPDATE ON public.credit_earning_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default credit earning rules
INSERT INTO public.credit_earning_rules (rule_name, rule_description, credit_amount, daily_limit, cooldown_hours, max_per_target, requires_verification, internal_notes) VALUES
('First Helpful Click on Post', 'Earn credits when your post receives its first helpful vote', 1.0, NULL, NULL, NULL, false, 'Use diminishing model for subsequent votes'),
('Second Helpful Click on Same Post', 'Reduced credits for second helpful vote on same post', 0.5, NULL, NULL, NULL, false, 'Auto-calculated diminishing returns'),
('Third Helpful Click on Same Post', 'Further reduced credits for third helpful vote', 0.25, NULL, NULL, NULL, false, 'Auto-calculated diminishing returns'),
('Mark Post as Helpful', 'Earn credits for marking others posts as helpful', 1.0, 1, NULL, NULL, false, 'Prevent toggling abuse - max 1 credit per day'),
('Review Network Vendor', 'Credits for reviewing a vendor in your network', 1.0, NULL, NULL, NULL, true, 'Only after confirmed connection'),
('Review Network Field Rep', 'Credits for reviewing field rep you have worked with', 1.0, NULL, NULL, NULL, true, 'Verified by network connection'),
('Successful Referral Network Join', 'Credits when referral joins and enters network', 1.0, NULL, NULL, NULL, true, 'Prevent fake/spam referrals'),
('Network Alert First Helpful', 'Credits when network alert marked helpful by vendor (first time)', 1.0, NULL, NULL, NULL, false, 'Triggered by vendor interaction'),
('Network Alert Second Helpful', 'Reduced credits for second helpful on network alert', 0.5, NULL, NULL, NULL, false, 'Diminishing returns model'),
('Network Alert Third Helpful', 'Further reduced credits for third helpful', 0.25, NULL, NULL, NULL, false, 'Max credits per alert configurable'),
('New County Connection', 'Credits for connecting to rep/vendor in new county', 1.0, NULL, NULL, 1, false, 'First-time connection only per county'),
('Upload Verified Work History', 'Credits for uploading verified work history', 1.0, NULL, NULL, 1, true, 'Manual admin approval required'),
('Submit Accepted Tip', 'Credits for submitting accepted tip or best practice', 1.0, NULL, NULL, NULL, true, 'Community approved or admin verified'),
('Weekly Message Reply Streak', 'Credits for maintaining weekly on-time message reply streak', 1.0, 1, 168, NULL, false, 'Optional toggle - 1 per week max'),
('Complete 100% Profile', 'One-time credits for completing profile to 100%', 1.0, NULL, NULL, 1, false, 'Initial setup reward - one time only');
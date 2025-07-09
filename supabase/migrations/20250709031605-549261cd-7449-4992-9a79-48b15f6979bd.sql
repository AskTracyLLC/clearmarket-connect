-- Add search refund credit earning rule
INSERT INTO public.credit_earning_rules (
  rule_name,
  rule_description,
  credit_amount,
  daily_limit,
  cooldown_hours,
  max_per_target,
  requires_verification,
  is_enabled,
  internal_notes
) VALUES (
  'search_refund',
  'Credit refund for searches with no out-of-network results',
  1, -- Dynamic amount will be handled in the function
  NULL, -- No daily limit for refunds
  NULL, -- No cooldown for refunds
  NULL, -- No max per target for refunds
  false, -- No verification required for refunds
  true, -- Enabled
  'Automatic refund system for searches that return no out-of-network field reps or only in-network field reps'
);
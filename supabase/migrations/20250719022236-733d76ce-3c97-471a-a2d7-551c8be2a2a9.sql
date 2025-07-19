-- Clear Tracy's profile data to start fresh
-- This will allow proper signup flow without workarounds

-- Delete NDA signature
DELETE FROM public.nda_signatures 
WHERE user_id = '9a0654d9-e0dd-4ebc-81c1-49841893e479';

-- Delete user profile
DELETE FROM public.users 
WHERE id = '9a0654d9-e0dd-4ebc-81c1-49841893e479';

-- Delete credits record
DELETE FROM public.credits 
WHERE user_id = '9a0654d9-e0dd-4ebc-81c1-49841893e479';

-- Delete any audit logs (optional cleanup)
DELETE FROM public.audit_log 
WHERE user_id = '9a0654d9-e0dd-4ebc-81c1-49841893e479';

-- Delete any credit transactions
DELETE FROM public.credit_transactions 
WHERE user_id = '9a0654d9-e0dd-4ebc-81c1-49841893e479';

-- The auth.users record will remain so you can still login with tracy@asktracyllc.com
-- but all profile data will be cleared for fresh setup
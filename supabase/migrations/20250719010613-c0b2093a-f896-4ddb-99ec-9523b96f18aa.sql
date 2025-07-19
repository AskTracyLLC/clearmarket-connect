-- Mark tracy@asktracyllc as having signed the NDA
INSERT INTO public.nda_signatures (user_id, signature_name, signature_version, is_active)
SELECT 
    au.id,
    'Tracy (Admin Override)',
    'v1',
    true
FROM auth.users au
WHERE au.email = 'tracy@asktracyllc'
AND NOT EXISTS (
    SELECT 1 FROM public.nda_signatures ns 
    WHERE ns.user_id = au.id AND ns.is_active = true
);
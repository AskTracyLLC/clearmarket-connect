-- Remove NDA signature and documents for rewby1@gmail.com
DELETE FROM public.nda_signatures 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'rewby1@gmail.com'
);

DELETE FROM public.user_documents 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'rewby1@gmail.com'
)
AND document_type = 'nda';

-- Update users table to reflect unsigned NDA
UPDATE public.users 
SET nda_signed = false,
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'rewby1@gmail.com'
);
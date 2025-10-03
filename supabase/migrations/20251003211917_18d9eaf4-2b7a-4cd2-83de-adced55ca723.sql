-- Start fresh: remove NDA records and mark as unsigned for this user
-- 1) Remove NDA signature rows
DELETE FROM public.nda_signatures 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'rewby1@gmail.com'
);

-- 2) Remove NDA documents metadata
DELETE FROM public.user_documents 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'rewby1@gmail.com'
)
AND document_type = 'nda';

-- 3) Reset NDA status on users table
UPDATE public.users 
SET nda_signed = false,
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'rewby1@gmail.com'
);
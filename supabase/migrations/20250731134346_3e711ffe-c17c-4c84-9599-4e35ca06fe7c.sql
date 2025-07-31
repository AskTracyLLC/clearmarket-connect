-- Create a function to get beta tester data with actual NDA status
CREATE OR REPLACE FUNCTION get_beta_testers_with_nda_status()
RETURNS TABLE(
  id uuid,
  email text,
  user_type text,
  name text,
  signup_date timestamp with time zone,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  nda_signed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bt.id,
    bt.email,
    bt.user_type,
    bt.name,
    bt.signup_date,
    bt.is_active,
    bt.created_at,
    bt.updated_at,
    COALESCE(u.nda_signed, false) as nda_signed
  FROM public.beta_testers bt
  LEFT JOIN auth.users au ON au.email = bt.email
  LEFT JOIN public.users u ON u.id = au.id
  ORDER BY bt.created_at DESC;
END;
$$;
-- Create admin user account for tracy@asktracyllc.com
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert into auth.users table
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmed_at,
    email_change_confirm_status,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    admin_user_id,
    'tracy@asktracyllc.com',
    crypt('Tr@cy123', gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    0,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "Admin#1"}'::jsonb,
    false,
    'authenticated',
    'authenticated'
  );
  
  -- Insert into public.users table with admin role
  INSERT INTO public.users (
    id,
    anonymous_username,
    display_name,
    role,
    trust_score,
    profile_complete,
    storage_limit_mb,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Admin#1',
    'Admin#1',
    'admin',
    100,
    100,
    1000,
    now(),
    now()
  );
  
  -- Insert into public.credits table with admin bonus
  INSERT INTO public.credits (
    user_id,
    current_balance,
    earned_credits,
    paid_credits,
    updated_at
  ) VALUES (
    admin_user_id,
    100,
    100,
    0,
    now()
  );
  
END $$;
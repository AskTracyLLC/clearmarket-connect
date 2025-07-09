-- Create test users for each role type
-- Note: This uses Supabase's auth admin functions

-- Create admin user
DO $$
DECLARE
    admin_user_id UUID;
    mod_user_id UUID;
    vendor_user_id UUID;
    rep_user_id UUID;
BEGIN
    -- Insert admin user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@clearmarket.com',
        crypt('admin1', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "Admin User"}',
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Insert moderator user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'mod@clearmarket.com',
        crypt('moderator1', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "Moderator User"}',
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO mod_user_id;

    -- Insert vendor user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'vendor@clearmarket.com',
        crypt('vendor1', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "Vendor User"}',
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO vendor_user_id;

    -- Insert field rep user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'rep@clearmarket.com',
        crypt('fieldrep1', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "Field Rep User"}',
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO rep_user_id;

    -- Insert corresponding public.users records with correct roles
    INSERT INTO public.users (id, display_name, role, trust_score, profile_complete) VALUES
    (admin_user_id, 'Admin User', 'admin', 100, 100),
    (mod_user_id, 'Moderator User', 'moderator', 90, 100),
    (vendor_user_id, 'Vendor User', 'vendor', 85, 80),
    (rep_user_id, 'Field Rep User', 'field_rep', 75, 90);

    -- Insert credit records for each user
    INSERT INTO public.credits (user_id, current_balance, earned_credits) VALUES
    (admin_user_id, 100, 100),
    (mod_user_id, 50, 50),
    (vendor_user_id, 25, 25),
    (rep_user_id, 15, 15);

END $$;
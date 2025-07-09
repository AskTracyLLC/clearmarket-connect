-- Create test user accounts instructions
-- These test accounts need to be created through Supabase Auth Dashboard
-- This migration prepares the roles and instructions

-- First, let's create a temporary table with test user information
CREATE TEMP TABLE test_users_info (
    email TEXT,
    password TEXT,
    role user_role,
    display_name TEXT,
    trust_score INTEGER,
    profile_complete INTEGER,
    credits INTEGER
);

INSERT INTO test_users_info VALUES
('admin@clearmarket.com', 'admin1', 'admin', 'Admin User', 100, 100, 100),
('mod@clearmarket.com', 'moderator1', 'moderator', 'Moderator User', 90, 100, 50),
('vendor@clearmarket.com', 'vendor1', 'vendor', 'Vendor User', 85, 80, 25),
('rep@clearmarket.com', 'fieldrep1', 'field_rep', 'Field Rep User', 75, 90, 15);

-- Create a function to setup test user data once auth users exist
CREATE OR REPLACE FUNCTION setup_test_user(
    user_email TEXT,
    user_role user_role,
    display_name_val TEXT,
    trust_score_val INTEGER,
    profile_complete_val INTEGER,
    credits_val INTEGER
) RETURNS VOID AS $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Get user ID from auth.users by email
    SELECT id INTO user_id_val FROM auth.users WHERE email = user_email;
    
    IF user_id_val IS NOT NULL THEN
        -- Insert or update user profile
        INSERT INTO public.users (id, display_name, role, trust_score, profile_complete)
        VALUES (user_id_val, display_name_val, user_role, trust_score_val, profile_complete_val)
        ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            role = EXCLUDED.role,
            trust_score = EXCLUDED.trust_score,
            profile_complete = EXCLUDED.profile_complete;
        
        -- Insert or update credits
        INSERT INTO public.credits (user_id, current_balance, earned_credits)
        VALUES (user_id_val, credits_val, credits_val)
        ON CONFLICT (user_id) DO UPDATE SET
            current_balance = EXCLUDED.current_balance,
            earned_credits = EXCLUDED.earned_credits;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Display instructions for manual setup
DO $$
BEGIN
    RAISE NOTICE 'TEST USERS SETUP INSTRUCTIONS:';
    RAISE NOTICE '================================';
    RAISE NOTICE '';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Create these test users manually:';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin User:';
    RAISE NOTICE '  Email: admin@clearmarket.com';
    RAISE NOTICE '  Password: admin1';
    RAISE NOTICE '';
    RAISE NOTICE 'Moderator User:';
    RAISE NOTICE '  Email: mod@clearmarket.com';
    RAISE NOTICE '  Password: moderator1';
    RAISE NOTICE '';
    RAISE NOTICE 'Vendor User:';
    RAISE NOTICE '  Email: vendor@clearmarket.com';
    RAISE NOTICE '  Password: vendor1';
    RAISE NOTICE '';
    RAISE NOTICE 'Field Rep User:';
    RAISE NOTICE '  Email: rep@clearmarket.com';
    RAISE NOTICE '  Password: fieldrep1';
    RAISE NOTICE '';
    RAISE NOTICE '3. After creating each user, run the setup function:';
    RAISE NOTICE '   SELECT setup_test_user(''admin@clearmarket.com'', ''admin'', ''Admin User'', 100, 100, 100);';
    RAISE NOTICE '   SELECT setup_test_user(''mod@clearmarket.com'', ''moderator'', ''Moderator User'', 90, 100, 50);';
    RAISE NOTICE '   SELECT setup_test_user(''vendor@clearmarket.com'', ''vendor'', ''Vendor User'', 85, 80, 25);';
    RAISE NOTICE '   SELECT setup_test_user(''rep@clearmarket.com'', ''field_rep'', ''Field Rep User'', 75, 90, 15);';
END $$;
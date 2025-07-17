-- Create the user_role enum type that's missing
CREATE TYPE user_role AS ENUM ('field_rep', 'vendor', 'moderator', 'admin');

-- Also ensure we have the other enum types that might be referenced
DO $$ BEGIN
    CREATE TYPE unlock_method AS ENUM ('credits', 'network_connection', 'admin_override');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE flag_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE flag_target_type AS ENUM ('post', 'comment', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
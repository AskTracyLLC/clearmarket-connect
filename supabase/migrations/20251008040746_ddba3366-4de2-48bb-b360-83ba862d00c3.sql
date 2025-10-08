-- Sync all display_name values to match anonymous_username
-- This ensures display_name and anonymous_username are always the same
UPDATE public.users
SET display_name = anonymous_username
WHERE display_name IS DISTINCT FROM anonymous_username;
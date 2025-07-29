-- Continue fixing remaining database functions with search_path
-- This addresses the remaining function search path mutable warnings

CREATE OR REPLACE FUNCTION public.populate_location_data_from_csv()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  csv_record RECORD;
  state_id_var UUID;
  county_id_var UUID;
BEGIN
  -- Clear existing normalized data
  DELETE FROM public.zip_codes;
  DELETE FROM public.counties;
  DELETE FROM public.states;
  
  -- Loop through zip_county_classifications and normalize the data
  FOR csv_record IN 
    SELECT DISTINCT state, county_name, zip_code, rural_urban_designation 
    FROM public.zip_county_classifications 
    ORDER BY state, county_name, zip_code
  LOOP
    -- Insert or get state
    INSERT INTO public.states (name, code)
    SELECT 
      CASE csv_record.state
        WHEN 'AL' THEN 'Alabama'
        WHEN 'AK' THEN 'Alaska'
        WHEN 'AZ' THEN 'Arizona'
        WHEN 'AR' THEN 'Arkansas'
        WHEN 'CA' THEN 'California'
        WHEN 'CO' THEN 'Colorado'
        WHEN 'CT' THEN 'Connecticut'
        WHEN 'DE' THEN 'Delaware'
        WHEN 'FL' THEN 'Florida'
        WHEN 'GA' THEN 'Georgia'
        WHEN 'HI' THEN 'Hawaii'
        WHEN 'ID' THEN 'Idaho'
        WHEN 'IL' THEN 'Illinois'
        WHEN 'IN' THEN 'Indiana'
        WHEN 'IA' THEN 'Iowa'
        WHEN 'KS' THEN 'Kansas'
        WHEN 'KY' THEN 'Kentucky'
        WHEN 'LA' THEN 'Louisiana'
        WHEN 'ME' THEN 'Maine'
        WHEN 'MD' THEN 'Maryland'
        WHEN 'MA' THEN 'Massachusetts'
        WHEN 'MI' THEN 'Michigan'
        WHEN 'MN' THEN 'Minnesota'
        WHEN 'MS' THEN 'Mississippi'
        WHEN 'MO' THEN 'Missouri'
        WHEN 'MT' THEN 'Montana'
        WHEN 'NE' THEN 'Nebraska'
        WHEN 'NV' THEN 'Nevada'
        WHEN 'NH' THEN 'New Hampshire'
        WHEN 'NJ' THEN 'New Jersey'
        WHEN 'NM' THEN 'New Mexico'
        WHEN 'NY' THEN 'New York'
        WHEN 'NC' THEN 'North Carolina'
        WHEN 'ND' THEN 'North Dakota'
        WHEN 'OH' THEN 'Ohio'
        WHEN 'OK' THEN 'Oklahoma'
        WHEN 'OR' THEN 'Oregon'
        WHEN 'PA' THEN 'Pennsylvania'
        WHEN 'RI' THEN 'Rhode Island'
        WHEN 'SC' THEN 'South Carolina'
        WHEN 'SD' THEN 'South Dakota'
        WHEN 'TN' THEN 'Tennessee'
        WHEN 'TX' THEN 'Texas'
        WHEN 'UT' THEN 'Utah'
        WHEN 'VT' THEN 'Vermont'
        WHEN 'VA' THEN 'Virginia'
        WHEN 'WA' THEN 'Washington'
        WHEN 'WV' THEN 'West Virginia'
        WHEN 'WI' THEN 'Wisconsin'
        WHEN 'WY' THEN 'Wyoming'
        WHEN 'DC' THEN 'District of Columbia'
        WHEN 'PR' THEN 'Puerto Rico'
        WHEN 'VI' THEN 'Virgin Islands'
        WHEN 'AS' THEN 'American Samoa'
        WHEN 'GU' THEN 'Guam'
        WHEN 'MP' THEN 'Northern Mariana Islands'
        ELSE csv_record.state
      END,
      csv_record.state
    ON CONFLICT (code) DO NOTHING;
    
    -- Get state ID
    SELECT id INTO state_id_var 
    FROM public.states 
    WHERE code = csv_record.state;
    
    -- Insert or get county
    INSERT INTO public.counties (name, state_id)
    VALUES (csv_record.county_name, state_id_var)
    ON CONFLICT (name, state_id) DO NOTHING;
    
    -- Get county ID
    SELECT id INTO county_id_var 
    FROM public.counties 
    WHERE name = csv_record.county_name AND state_id = state_id_var;
    
    -- Insert zip code
    INSERT INTO public.zip_codes (zip_code, county_id, state_id, rural_urban_designation)
    VALUES (csv_record.zip_code, county_id_var, state_id_var, csv_record.rural_urban_designation)
    ON CONFLICT (zip_code) DO UPDATE SET
      county_id = EXCLUDED.county_id,
      state_id = EXCLUDED.state_id,
      rural_urban_designation = EXCLUDED.rural_urban_designation,
      updated_at = now();
  END LOOP;
END;
$function$;

-- Fix more security functions
CREATE OR REPLACE FUNCTION public.handle_beta_signup_from_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  user_anonymous_username TEXT;
BEGIN
  -- Only process if interested_in_beta changed to true
  IF NEW.interested_in_beta = true AND (OLD.interested_in_beta IS NULL OR OLD.interested_in_beta = false) THEN
    -- Get user email and anonymous username
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT anonymous_username INTO user_anonymous_username FROM public.users WHERE id = NEW.user_id;
    
    -- Insert into beta_testers table if not already exists
    INSERT INTO public.beta_testers (email, user_type, name, signup_date)
    VALUES (
      user_email,
      'field-rep',
      COALESCE(user_anonymous_username, NEW.first_name || ' ' || NEW.last_name),
      now()
    )
    ON CONFLICT (email) DO UPDATE SET
      is_active = true,
      updated_at = now();
    
    -- Call edge function to send beta confirmation email
    PERFORM http((
      'POST',
      'https://bgqlhaqwsnfhhatxhtfx.supabase.co/functions/v1/send-beta-confirmation-email',
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWxoYXF3c25maGhhdHhodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk1MDksImV4cCI6MjA2NzUxNTUwOX0.El8dESk86p4-yb8gIIoheKHRMl2YTegQb9BIfaKIhAU')
      ],
      'application/json',
      jsonb_build_object(
        'signupType', 'field_rep',
        'email', user_email,
        'anonymous_username', user_anonymous_username,
        'credentials', jsonb_build_object(
          'email', user_email,
          'password', 'GeneratedPassword123!'
        )
      )::text
    ));
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix more critical functions
CREATE OR REPLACE FUNCTION public.get_or_create_user_preferences(target_user_id uuid)
 RETURNS user_preferences
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  prefs public.user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO prefs 
  FROM public.user_preferences 
  WHERE user_id = target_user_id;
  
  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (target_user_id)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$function$;

-- Fix utility functions  
CREATE OR REPLACE FUNCTION public.update_post_tags_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only update timestamp if tags actually changed
  IF (OLD.user_tags IS DISTINCT FROM NEW.user_tags) OR 
     (OLD.system_tags IS DISTINCT FROM NEW.system_tags) THEN
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_trending_tags(days_back integer DEFAULT 30, tag_limit integer DEFAULT 10, section_filter text DEFAULT NULL::text)
 RETURNS TABLE(tag_name text, tag_count bigint)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    unnest_tags.tag,
    COUNT(*) as count
  FROM (
    SELECT unnest(user_tags) as tag
    FROM public.community_posts 
    WHERE 
      created_at >= NOW() - INTERVAL '1 day' * days_back
      AND (section_filter IS NULL OR section = section_filter)
      AND user_tags IS NOT NULL 
      AND array_length(user_tags, 1) > 0
  ) unnest_tags
  GROUP BY unnest_tags.tag
  ORDER BY count DESC, unnest_tags.tag ASC
  LIMIT tag_limit;
END;
$function$;

-- Secure RLS policy to prevent anonymous access to pre_launch_signups
DROP POLICY IF EXISTS "Anyone can create pre-launch signups" ON public.pre_launch_signups;
CREATE POLICY "Authenticated users can create pre-launch signups" 
ON public.pre_launch_signups 
FOR INSERT 
TO authenticated
WITH CHECK (true);
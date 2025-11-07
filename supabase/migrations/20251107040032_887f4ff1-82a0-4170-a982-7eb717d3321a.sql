-- Give new vendors 25 free ClearCredits during beta
-- Update handle_new_user function to initialize vendor credits

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_type TEXT;
  generated_username TEXT;
  user_role_value user_role;
BEGIN
  -- Determine user type from metadata or default to field_rep
  user_type := COALESCE(NEW.raw_user_meta_data->>'role', 'field_rep');
  
  -- Map role to username type
  user_type := CASE user_type
    WHEN 'field_rep' THEN 'field-rep'
    WHEN 'vendor' THEN 'vendor'
    WHEN 'admin' THEN 'admin'
    WHEN 'moderator' THEN 'moderator'
    ELSE 'field-rep'
  END;
  
  -- Generate username if not provided in metadata
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'anonymous_username',
    public.generate_anonymous_username(user_type)
  );
  
  -- Get the user role for credits initialization
  user_role_value := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'field_rep'::user_role);
  
  INSERT INTO public.users (
    id,
    email,
    role,
    anonymous_username,
    display_name,
    trust_score,
    community_score,
    profile_complete,
    nda_signed
  ) VALUES (
    NEW.id,
    NEW.email,
    user_role_value,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      generated_username
    ),
    50,
    50,
    0,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  -- Initialize credits based on role
  -- Vendors get 25 free ClearCredits during beta
  -- Field Reps start with 0 ClearCredits but can earn RepPoints
  IF user_role_value = 'vendor' THEN
    INSERT INTO public.credits (
      user_id,
      current_balance,
      earned_credits,
      paid_credits,
      rep_points,
      anonymous_username
    ) VALUES (
      NEW.id,
      25,
      25,
      0,
      0,
      generated_username
    );
    
    -- Log the beta credit grant
    INSERT INTO public.credit_transactions (
      user_id,
      amount,
      currency_type,
      transaction_type,
      reference_type,
      metadata,
      anonymous_username
    ) VALUES (
      NEW.id,
      25,
      'clear_credits',
      'beta_bonus',
      'vendor_signup',
      jsonb_build_object(
        'reason', 'Beta signup bonus - 25 free ClearCredits',
        'note', 'Welcome bonus for early adopters'
      ),
      generated_username
    );
  ELSE
    -- Field reps and other roles start with 0
    INSERT INTO public.credits (
      user_id,
      current_balance,
      earned_credits,
      paid_credits,
      rep_points,
      anonymous_username
    ) VALUES (
      NEW.id,
      0,
      0,
      0,
      0,
      generated_username
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
-- Enhance audit_log table to track admin activity more comprehensively
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS performed_by_admin boolean DEFAULT false;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS ip_address inet;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS user_agent text;

-- Create function to automatically log profile updates
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  changes jsonb := '{}';
BEGIN
  -- Build changes object for significant profile updates
  IF OLD.display_name IS DISTINCT FROM NEW.display_name THEN
    changes := changes || jsonb_build_object('display_name', jsonb_build_object('old', OLD.display_name, 'new', NEW.display_name));
  END IF;
  
  IF OLD.trust_score IS DISTINCT FROM NEW.trust_score THEN
    changes := changes || jsonb_build_object('trust_score', jsonb_build_object('old', OLD.trust_score, 'new', NEW.trust_score));
  END IF;
  
  IF OLD.profile_complete IS DISTINCT FROM NEW.profile_complete THEN
    changes := changes || jsonb_build_object('profile_complete', jsonb_build_object('old', OLD.profile_complete, 'new', NEW.profile_complete));
  END IF;
  
  -- Only log if there were actual changes
  IF changes != '{}' THEN
    INSERT INTO public.audit_log (
      user_id, 
      action, 
      target_table, 
      target_id, 
      metadata,
      performed_by_admin
    ) VALUES (
      auth.uid(),
      'profile_update',
      'users',
      NEW.id,
      changes,
      CASE WHEN auth.uid() != NEW.id THEN true ELSE false END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS trigger_log_profile_update ON public.users;
CREATE TRIGGER trigger_log_profile_update
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_update();

-- Create function to log post removals by admins
CREATE OR REPLACE FUNCTION public.log_post_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log deletions by admins/moderators, not by post owners
  IF auth.uid() != OLD.user_id THEN
    INSERT INTO public.audit_log (
      user_id, 
      action, 
      target_table, 
      target_id, 
      metadata,
      performed_by_admin
    ) VALUES (
      auth.uid(),
      'post_removed',
      'community_posts',
      OLD.id,
      jsonb_build_object(
        'post_title', OLD.title,
        'post_content', LEFT(OLD.content, 100),
        'original_author', OLD.user_id,
        'post_type', OLD.post_type,
        'section', OLD.section
      ),
      true
    );
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger for post deletions
DROP TRIGGER IF EXISTS trigger_log_post_removal ON public.community_posts;
CREATE TRIGGER trigger_log_post_removal
  BEFORE DELETE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_post_removal();

-- Create function to log user creation
CREATE OR REPLACE FUNCTION public.log_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id, 
    action, 
    target_table, 
    target_id, 
    metadata
  ) VALUES (
    NEW.id,
    'user_created',
    'users',
    NEW.id,
    jsonb_build_object(
      'role', NEW.role,
      'anonymous_username', NEW.anonymous_username,
      'signup_method', 'direct'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for user creation
DROP TRIGGER IF EXISTS trigger_log_user_creation ON public.users;
CREATE TRIGGER trigger_log_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_creation();

-- Create function to log review activities
CREATE OR REPLACE FUNCTION public.log_review_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log review submission
  INSERT INTO public.audit_log (
    user_id, 
    action, 
    target_table, 
    target_id, 
    metadata
  ) VALUES (
    NEW.reviewer_id,
    'review_submitted',
    'reviews',
    NEW.id,
    jsonb_build_object(
      'reviewed_user_id', NEW.reviewed_user_id,
      'rating', NEW.rating,
      'verified', NEW.verified
    )
  );
  
  -- Log review received for the target user
  INSERT INTO public.audit_log (
    user_id, 
    action, 
    target_table, 
    target_id, 
    metadata
  ) VALUES (
    NEW.reviewed_user_id,
    'review_received',
    'reviews',
    NEW.id,
    jsonb_build_object(
      'reviewer_id', NEW.reviewer_id,
      'rating', NEW.rating,
      'verified', NEW.verified
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for review creation
DROP TRIGGER IF EXISTS trigger_log_review_activity ON public.reviews;
CREATE TRIGGER trigger_log_review_activity
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.log_review_activity();

-- Create function to update user last_active timestamp and log login
CREATE OR REPLACE FUNCTION public.update_last_active_and_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_first_login boolean := false;
BEGIN
  -- Check if this is the first login (last_active was null)
  IF OLD.last_active IS NULL THEN
    is_first_login := true;
  END IF;
  
  -- Update last_active timestamp
  NEW.last_active := now();
  
  -- Log first login
  IF is_first_login THEN
    INSERT INTO public.audit_log (
      user_id, 
      action, 
      target_table, 
      target_id, 
      metadata
    ) VALUES (
      NEW.id,
      'first_login',
      'users',
      NEW.id,
      jsonb_build_object('timestamp', now())
    );
  ELSE
    -- Log regular login (but limit frequency to avoid spam)
    -- Only log if last login was more than 1 hour ago
    IF OLD.last_active IS NULL OR OLD.last_active < (now() - interval '1 hour') THEN
      INSERT INTO public.audit_log (
        user_id, 
        action, 
        target_table, 
        target_id, 
        metadata
      ) VALUES (
        NEW.id,
        'login',
        'users',
        NEW.id,
        jsonb_build_object('timestamp', now())
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to manually update last_active (called from application)
CREATE OR REPLACE FUNCTION public.update_user_last_active(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_record public.users;
BEGIN
  -- Get current user record
  SELECT * INTO current_user_record
  FROM public.users
  WHERE id = target_user_id;
  
  IF current_user_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if this is the first login
  IF current_user_record.last_active IS NULL THEN
    INSERT INTO public.audit_log (
      user_id, 
      action, 
      target_table, 
      target_id, 
      metadata
    ) VALUES (
      target_user_id,
      'first_login',
      'users',
      target_user_id,
      jsonb_build_object('timestamp', now())
    );
  ELSE
    -- Log regular login (but limit frequency)
    IF current_user_record.last_active < (now() - interval '1 hour') THEN
      INSERT INTO public.audit_log (
        user_id, 
        action, 
        target_table, 
        target_id, 
        metadata
      ) VALUES (
        target_user_id,
        'login',
        'users',
        target_user_id,
        jsonb_build_object('timestamp', now())
      );
    END IF;
  END IF;
  
  -- Update the last_active timestamp
  UPDATE public.users 
  SET last_active = now()
  WHERE id = target_user_id;
END;
$$;
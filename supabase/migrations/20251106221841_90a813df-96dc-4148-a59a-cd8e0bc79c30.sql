-- Fix admin_delete_user_completely to use correct column names
CREATE OR REPLACE FUNCTION public.admin_delete_user_completely(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_email TEXT;
  caller_role user_role;
  target_email TEXT;
  deletion_result JSONB;
BEGIN
  -- Get caller's email and role
  caller_email := get_user_email(auth.uid());
  caller_role := get_user_role(auth.uid());
  
  -- Verify caller is an admin
  IF caller_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can delete users completely'
    );
  END IF;
  
  -- Prevent admins from deleting themselves
  IF target_user_id = auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot delete your own account'
    );
  END IF;
  
  -- Get target user email for logging
  target_email := get_user_email(target_user_id);
  
  -- Log the deletion action
  INSERT INTO public.audit_log (
    user_id,
    action,
    target_table,
    target_id,
    metadata,
    performed_by_admin
  ) VALUES (
    auth.uid(),
    'ADMIN_DELETE_USER_COMPLETELY',
    'users',
    target_user_id,
    jsonb_build_object(
      'target_email', target_email,
      'deleted_by', caller_email,
      'timestamp', now()
    ),
    true
  );
  
  -- Delete all user data (cascading deletes will handle related records)
  -- Note: Order matters due to foreign key constraints
  
  -- Delete trust score reviews
  DELETE FROM public.trust_score_reviews WHERE reviewer_id = target_user_id OR reviewed_user_id = target_user_id;
  
  -- Delete user documents
  DELETE FROM public.user_documents WHERE user_id = target_user_id;
  
  -- Delete vendor staff memberships (only remove user from organizations, don't delete orgs)
  DELETE FROM public.vendor_staff_members WHERE user_id = target_user_id;
  
  -- Delete coverage areas
  DELETE FROM public.coverage_areas WHERE user_id = target_user_id;
  
  -- Delete calendar events
  DELETE FROM public.calendar_events WHERE user_id = target_user_id;
  
  -- Delete connection requests
  DELETE FROM public.connection_requests WHERE sender_id = target_user_id OR recipient_id = target_user_id;
  
  -- Delete contact unlocks
  DELETE FROM public.contact_unlocks WHERE unlocker_id = target_user_id OR unlocked_user_id = target_user_id;
  
  -- Delete direct messages
  DELETE FROM public.direct_messages WHERE sender_id = target_user_id OR recipient_id = target_user_id;
  
  -- Delete community posts and comments
  DELETE FROM public.community_comments WHERE user_id = target_user_id;
  DELETE FROM public.community_posts WHERE user_id = target_user_id;
  
  -- Delete credit transactions
  DELETE FROM public.credit_transactions WHERE user_id = target_user_id;
  
  -- Delete credits
  DELETE FROM public.credits WHERE user_id = target_user_id;
  
  -- Delete coverage requests
  DELETE FROM public.coverage_requests WHERE vendor_id = target_user_id;
  
  -- Delete auto reply settings
  DELETE FROM public.auto_reply_settings WHERE user_id = target_user_id;
  
  -- Delete user profile
  DELETE FROM public.user_profiles WHERE user_id = target_user_id;
  
  -- Delete from users table
  DELETE FROM public.users WHERE id = target_user_id;
  
  -- Delete from auth.users (this will cascade to auth-related tables)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  deletion_result := jsonb_build_object(
    'success', true,
    'message', 'User and all associated data deleted successfully',
    'deleted_user_email', target_email
  );
  
  RETURN deletion_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;
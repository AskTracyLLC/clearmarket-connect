-- Create function to completely delete a user and ALL their data
-- This ensures complete cleanup when deleting users from admin panel

CREATE OR REPLACE FUNCTION public.admin_delete_user_completely(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  
  -- Delete all user data (order matters due to foreign key constraints)
  
  -- Delete trust score reviews
  DELETE FROM public.trust_score_reviews WHERE reviewer_id = target_user_id OR reviewed_user_id = target_user_id;
  
  -- Delete user documents
  DELETE FROM public.user_documents WHERE user_id = target_user_id;
  
  -- Delete vendor staff memberships
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
  
  -- Delete coverage request responses
  DELETE FROM public.coverage_request_responses WHERE field_rep_id = target_user_id;
  
  -- Delete coverage request passes
  DELETE FROM public.coverage_request_passes WHERE field_rep_id = target_user_id OR vendor_id = target_user_id;
  
  -- Delete coverage request messages
  DELETE FROM public.coverage_request_messages WHERE sender_id = target_user_id OR recipient_id = target_user_id;
  
  -- Delete bulk message recipients
  DELETE FROM public.bulk_message_recipients WHERE recipient_id = target_user_id;
  
  -- Delete bulk messages
  DELETE FROM public.bulk_messages WHERE sender_id = target_user_id;
  
  -- Delete auto reply settings
  DELETE FROM public.auto_reply_settings WHERE user_id = target_user_id;
  
  -- Delete daily credit earnings
  DELETE FROM public.daily_credit_earnings WHERE user_id = target_user_id;
  
  -- Delete daily connection request limits
  DELETE FROM public.daily_connection_request_limits WHERE user_id = target_user_id;
  
  -- Delete daily invite limits
  DELETE FROM public.daily_invite_limits WHERE user_id = target_user_id;
  
  -- Delete saved searches
  DELETE FROM public.saved_searches WHERE user_id = target_user_id;
  
  -- Delete saved posts
  DELETE FROM public.saved_posts WHERE user_id = target_user_id;
  
  -- Delete post helpful votes
  DELETE FROM public.post_helpful_votes WHERE user_id = target_user_id;
  
  -- Delete user preferences
  DELETE FROM public.user_preferences WHERE user_id = target_user_id;
  
  -- Delete notifications
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  
  -- Delete field rep profiles
  DELETE FROM public.field_rep_profiles WHERE user_id = target_user_id;
  
  -- Delete vendor profiles
  DELETE FROM public.vendor_profiles WHERE user_id = target_user_id;
  
  -- Delete user profile
  DELETE FROM public.user_profiles WHERE user_id = target_user_id;
  
  -- Delete from users table
  DELETE FROM public.users WHERE id = target_user_id;
  
  -- Delete from auth.users (cascades to auth-related tables)
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
$$;
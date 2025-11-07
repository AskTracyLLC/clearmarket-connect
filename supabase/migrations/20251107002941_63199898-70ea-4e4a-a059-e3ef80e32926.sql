-- Fix admin_delete_user_completely function to remove invalid vendor_id reference
CREATE OR REPLACE FUNCTION admin_delete_user_completely(target_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role user_role;
  deleted_count INTEGER := 0;
  result jsonb;
BEGIN
  -- Check if caller is admin
  admin_role := get_user_role(auth.uid());
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Prevent self-deletion
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Admins cannot delete their own account';
  END IF;

  -- Delete from trust_score_reviews (both given and received)
  DELETE FROM trust_score_reviews WHERE reviewer_id = target_user_id OR reviewed_user_id = target_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Delete from user_documents
  DELETE FROM user_documents WHERE user_id = target_user_id;

  -- Delete from vendor_staff_members
  DELETE FROM vendor_staff_members WHERE user_id = target_user_id;

  -- Delete from coverage_requests
  DELETE FROM coverage_requests WHERE vendor_user_id = target_user_id;

  -- Delete from coverage_areas
  DELETE FROM coverage_areas WHERE user_id = target_user_id;

  -- Delete from contact_unlocks (both as unlocker and unlocked)
  DELETE FROM contact_unlocks WHERE unlocker_id = target_user_id OR unlocked_user_id = target_user_id;

  -- Delete from connection_requests (both sender and recipient)
  DELETE FROM connection_requests WHERE sender_id = target_user_id OR recipient_id = target_user_id;

  -- Delete from direct_messages (both sender and recipient)
  DELETE FROM direct_messages WHERE sender_id = target_user_id OR recipient_id = target_user_id;

  -- Delete from community_posts
  DELETE FROM community_posts WHERE user_id = target_user_id;

  -- Delete from community_comments
  DELETE FROM community_comments WHERE user_id = target_user_id;

  -- Delete from calendar_events
  DELETE FROM calendar_events WHERE user_id = target_user_id;

  -- Delete from credits
  DELETE FROM credits WHERE user_id = target_user_id;

  -- Delete from credit_transactions
  DELETE FROM credit_transactions WHERE user_id = target_user_id;

  -- Delete from credit_usage
  DELETE FROM credit_usage WHERE user_id = target_user_id;

  -- Delete from daily_connection_request_limits
  DELETE FROM daily_connection_request_limits WHERE user_id = target_user_id;

  -- Delete from daily_invite_limits
  DELETE FROM daily_invite_limits WHERE user_id = target_user_id;

  -- Delete from daily_credit_earnings
  DELETE FROM daily_credit_earnings WHERE user_id = target_user_id;

  -- Delete from user_profiles
  DELETE FROM user_profiles WHERE user_id = target_user_id;

  -- Delete from public.users
  DELETE FROM public.users WHERE id = target_user_id;

  -- Delete from auth.users (this cascades to auth-related tables)
  DELETE FROM auth.users WHERE id = target_user_id;

  -- Log the deletion
  INSERT INTO audit_log (user_id, action, target_table, target_id, metadata, performed_by_admin)
  VALUES (
    auth.uid(),
    'admin_delete_user_completely',
    'users',
    target_user_id,
    jsonb_build_object('deleted_user_id', target_user_id, 'admin_id', auth.uid()),
    true
  );

  result := jsonb_build_object(
    'success', true,
    'deleted_user_id', target_user_id,
    'message', 'User and all associated data deleted successfully'
  );

  RETURN result;
END;
$$;
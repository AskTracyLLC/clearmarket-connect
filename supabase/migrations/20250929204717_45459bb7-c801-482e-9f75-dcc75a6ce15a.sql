-- Create trigger function to notify field reps of new connection requests
CREATE OR REPLACE FUNCTION public.notify_new_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get sender's display name
  SELECT COALESCE(display_name, anonymous_username, 'A vendor')
  INTO sender_name
  FROM public.users
  WHERE id = NEW.sender_id;

  -- Create notification for the recipient (field rep)
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    target_id,
    target_type,
    metadata
  ) VALUES (
    NEW.recipient_id,
    'connection_request',
    'New Connection Request',
    sender_name || ' wants to connect with you',
    NEW.id,
    'connection_request',
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'sender_name', sender_name,
      'personal_message', NEW.personal_message
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new connection requests
DROP TRIGGER IF EXISTS on_new_connection_request ON public.connection_requests;
CREATE TRIGGER on_new_connection_request
  AFTER INSERT ON public.connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_connection_request();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
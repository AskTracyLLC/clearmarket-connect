-- Add cancelled status support to connection_requests if not exists
DO $$ 
BEGIN
  -- Check if the status column exists and update its check constraint
  -- This allows pending, accepted, rejected, cancelled statuses
  ALTER TABLE connection_requests DROP CONSTRAINT IF EXISTS connection_requests_status_check;
  ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create notifications table for connection request updates
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('connection_accepted', 'connection_rejected', 'connection_cancelled', 'review', 'comment', 'mention', 'vote', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  target_id UUID,
  target_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, read, created_at DESC);

-- Function to create notification when connection request status changes
CREATE OR REPLACE FUNCTION notify_connection_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on status changes from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Notify the sender (vendor) of the status change
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      target_id,
      target_type,
      metadata
    ) VALUES (
      NEW.sender_id,
      CASE 
        WHEN NEW.status = 'accepted' THEN 'connection_accepted'
        WHEN NEW.status = 'rejected' THEN 'connection_rejected'
        WHEN NEW.status = 'cancelled' THEN 'connection_cancelled'
      END,
      CASE 
        WHEN NEW.status = 'accepted' THEN 'Connection Request Accepted'
        WHEN NEW.status = 'rejected' THEN 'Connection Request Declined'
        WHEN NEW.status = 'cancelled' THEN 'Connection Request Cancelled'
      END,
      CASE 
        WHEN NEW.status = 'accepted' THEN 'Your connection request has been accepted!'
        WHEN NEW.status = 'rejected' THEN 'Your connection request was declined.'
        WHEN NEW.status = 'cancelled' THEN 'You cancelled this connection request.'
      END,
      NEW.id,
      'connection_request',
      jsonb_build_object(
        'recipient_id', NEW.recipient_id,
        'status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for connection request status changes
DROP TRIGGER IF EXISTS on_connection_status_change ON connection_requests;
CREATE TRIGGER on_connection_status_change
  AFTER UPDATE OF status ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_connection_status_change();
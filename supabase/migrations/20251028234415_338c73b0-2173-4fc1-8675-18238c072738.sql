-- Update feedback_posts table for new status system

-- Add status_changed_at to track when status was last modified
ALTER TABLE public.feedback_posts 
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add removed_at for soft deletes (null = visible, non-null = removed from public view)
ALTER TABLE public.feedback_posts 
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to set status_changed_at to created_at
UPDATE public.feedback_posts 
SET status_changed_at = created_at 
WHERE status_changed_at IS NULL;

-- Drop the old status check constraint if it exists
ALTER TABLE public.feedback_posts DROP CONSTRAINT IF EXISTS feedback_posts_status_check;

-- Add new status check constraint with updated values
ALTER TABLE public.feedback_posts 
ADD CONSTRAINT feedback_posts_status_check 
CHECK (status IN ('under-review', 'future-release', 'resolved', 'archived'));

-- Update existing statuses to map to new values
UPDATE public.feedback_posts 
SET status = CASE 
  WHEN status IN ('planned', 'in-progress') THEN 'future-release'
  WHEN status = 'completed' THEN 'resolved'
  WHEN status = 'closed' THEN 'archived'
  ELSE 'under-review'
END
WHERE status NOT IN ('under-review', 'future-release', 'resolved', 'archived');

-- Create trigger to update status_changed_at when status changes
CREATE OR REPLACE FUNCTION public.update_feedback_status_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_feedback_status_timestamp ON public.feedback_posts;
CREATE TRIGGER update_feedback_status_timestamp
  BEFORE UPDATE ON public.feedback_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feedback_status_changed_at();

-- Create function to auto-remove old resolved/archived posts
CREATE OR REPLACE FUNCTION public.auto_remove_old_feedback_posts()
RETURNS void AS $$
BEGIN
  -- Remove resolved posts older than 7 days
  UPDATE public.feedback_posts
  SET removed_at = now()
  WHERE status = 'resolved'
    AND removed_at IS NULL
    AND status_changed_at < now() - interval '7 days';
  
  -- Remove archived posts older than 14 days
  UPDATE public.feedback_posts
  SET removed_at = now()
  WHERE status = 'archived'
    AND removed_at IS NULL
    AND status_changed_at < now() - interval '14 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy to hide removed posts from non-admins
DROP POLICY IF EXISTS "Anyone can view feedback posts" ON public.feedback_posts;
CREATE POLICY "Anyone can view feedback posts" ON public.feedback_posts
  FOR SELECT USING (
    removed_at IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
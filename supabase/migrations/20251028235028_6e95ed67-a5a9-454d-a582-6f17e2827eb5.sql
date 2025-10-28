-- Add 'new' status and make it the default

-- Drop the old status check constraint
ALTER TABLE public.feedback_posts DROP CONSTRAINT IF EXISTS feedback_posts_status_check;

-- Add new status check constraint including 'new'
ALTER TABLE public.feedback_posts 
ADD CONSTRAINT feedback_posts_status_check 
CHECK (status IN ('new', 'under-review', 'future-release', 'resolved', 'archived'));

-- Update the status column to use 'new' as default
ALTER TABLE public.feedback_posts 
ALTER COLUMN status SET DEFAULT 'new';

-- Update any existing 'under-review' posts that are recent (within last 7 days) to 'new' status
-- This helps identify which posts haven't been reviewed yet
UPDATE public.feedback_posts 
SET status = 'new'
WHERE status = 'under-review' 
AND created_at > now() - interval '7 days'
AND status_changed_at = created_at; -- Only if status hasn't been manually changed
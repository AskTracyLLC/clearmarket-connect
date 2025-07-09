-- Check if user_comments table exists and drop old table if needed
DROP TABLE IF EXISTS public.vendor_rep_comments CASCADE;

-- Create user_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commenter_id UUID NOT NULL, -- User who wrote the comment
  target_user_id UUID NOT NULL, -- User being commented on
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(commenter_id, target_user_id)
);

-- Enable RLS on new table
ALTER TABLE public.user_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own comments" ON public.user_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.user_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.user_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.user_comments;

-- RLS Policies for user_comments
CREATE POLICY "Users can view their own comments"
ON public.user_comments
FOR SELECT
USING (auth.uid() = commenter_id);

CREATE POLICY "Users can create their own comments"
ON public.user_comments
FOR INSERT
WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can update their own comments"
ON public.user_comments
FOR UPDATE
USING (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments"
ON public.user_comments
FOR DELETE
USING (auth.uid() = commenter_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_comments_updated_at ON public.user_comments;

-- Add trigger for updated_at timestamps
CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON public.user_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
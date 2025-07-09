
-- Create a new bidirectional user comments table
CREATE TABLE public.user_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commenter_id UUID NOT NULL, -- User who wrote the comment
  target_user_id UUID NOT NULL, -- User being commented on
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(commenter_id, target_user_id)
);

-- Migrate existing vendor comments to new table
INSERT INTO public.user_comments (commenter_id, target_user_id, comment_text, created_at, updated_at)
SELECT vendor_id, field_rep_id, comment_text, created_at, updated_at
FROM public.vendor_rep_comments;

-- Enable RLS on new table
ALTER TABLE public.user_comments ENABLE ROW LEVEL SECURITY;

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

-- Add trigger for updated_at timestamps
CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON public.user_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drop old vendor_rep_comments table
DROP TABLE public.vendor_rep_comments;

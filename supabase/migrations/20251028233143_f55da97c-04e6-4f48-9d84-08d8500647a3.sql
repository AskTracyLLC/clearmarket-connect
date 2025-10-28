-- Create storage bucket for feedback screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-screenshots',
  'feedback-screenshots',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Add screenshot_urls column to feedback_posts
ALTER TABLE public.feedback_posts 
ADD COLUMN IF NOT EXISTS screenshot_urls text[] DEFAULT ARRAY[]::text[];

-- RLS policies for feedback-screenshots bucket
CREATE POLICY "Admins can upload feedback screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feedback-screenshots' 
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Admins can update feedback screenshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'feedback-screenshots' 
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Admins can delete feedback screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'feedback-screenshots' 
  AND public.is_admin_user(auth.uid())
);

CREATE POLICY "Anyone can view feedback screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-screenshots');
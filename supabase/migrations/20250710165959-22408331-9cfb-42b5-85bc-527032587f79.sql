-- Drop existing feedback_posts table and recreate with proper structure
DROP TABLE IF EXISTS public.feedback_posts;

-- Create feedback_posts table for authenticated users
CREATE TABLE public.feedback_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature-request',
  status TEXT NOT NULL DEFAULT 'under-review',
  upvotes INTEGER NOT NULL DEFAULT 0,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.feedback_posts ENABLE ROW LEVEL SECURITY;

-- Policy for everyone to view feedback posts
CREATE POLICY "Anyone can view feedback posts" 
ON public.feedback_posts 
FOR SELECT 
USING (true);

-- Policy for authenticated users to create posts
CREATE POLICY "Authenticated users can create posts" 
ON public.feedback_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own posts
CREATE POLICY "Users can update own posts" 
ON public.feedback_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for users to delete their own posts  
CREATE POLICY "Users can delete own posts" 
ON public.feedback_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_feedback_posts_updated_at
BEFORE UPDATE ON public.feedback_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
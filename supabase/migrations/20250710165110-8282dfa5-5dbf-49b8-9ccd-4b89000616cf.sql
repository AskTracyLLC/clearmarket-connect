-- Create feedback_posts table for anonymous feedback group users
CREATE TABLE public.feedback_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature-request',
  status TEXT NOT NULL DEFAULT 'under-review',
  author_username TEXT NOT NULL,
  author_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_posts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all feedback posts
CREATE POLICY "Anyone can view feedback posts" 
ON public.feedback_posts 
FOR SELECT 
USING (true);

-- Policy for feedback group members to create posts using their token
CREATE POLICY "Feedback users can create posts" 
ON public.feedback_posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feedback_sessions 
    WHERE feedback_sessions.access_token = feedback_posts.access_token 
    AND feedback_sessions.expires_at > now()
    AND feedback_sessions.user_email = feedback_posts.author_email
    AND feedback_sessions.anonymous_username = feedback_posts.author_username
  )
);

-- Policy for feedback group members to update their own posts
CREATE POLICY "Feedback users can update own posts" 
ON public.feedback_posts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.feedback_sessions 
    WHERE feedback_sessions.access_token = feedback_posts.access_token 
    AND feedback_sessions.expires_at > now()
    AND feedback_sessions.user_email = feedback_posts.author_email
    AND feedback_sessions.anonymous_username = feedback_posts.author_username
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_feedback_posts_updated_at
BEFORE UPDATE ON public.feedback_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
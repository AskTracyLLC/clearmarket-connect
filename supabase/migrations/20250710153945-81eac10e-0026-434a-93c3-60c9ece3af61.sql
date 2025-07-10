-- Add feedback group fields to pre_launch_signups table
ALTER TABLE public.pre_launch_signups 
ADD COLUMN join_feedback_group BOOLEAN DEFAULT false,
ADD COLUMN anonymous_username TEXT,
ADD COLUMN feedback_access_token TEXT,
ADD COLUMN feedback_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create feedback group sessions table for managing login tokens
CREATE TABLE public.feedback_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  anonymous_username TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on feedback_sessions
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for feedback sessions - users can view their own sessions via token
CREATE POLICY "Users can view own feedback sessions via token" 
ON public.feedback_sessions 
FOR SELECT 
USING (true); -- We'll handle security in the application layer since this uses tokens

-- Policy for system to insert sessions
CREATE POLICY "System can insert feedback sessions" 
ON public.feedback_sessions 
FOR INSERT 
WITH CHECK (true);

-- Policy for system to update sessions (for last_accessed)
CREATE POLICY "System can update feedback sessions" 
ON public.feedback_sessions 
FOR UPDATE 
USING (true);

-- Function to generate anonymous username
CREATE OR REPLACE FUNCTION generate_anonymous_username(user_type_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_prefix TEXT;
  next_number INTEGER;
  new_username TEXT;
BEGIN
  -- Set prefix based on user type
  IF user_type_param = 'vendor' THEN
    username_prefix := 'Vendor';
  ELSIF user_type_param = 'field-rep' THEN
    username_prefix := 'FieldRep';
  ELSE
    username_prefix := 'User';
  END IF;
  
  -- Get the next number for this user type
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(anonymous_username FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.pre_launch_signups
  WHERE anonymous_username LIKE username_prefix || '%'
    AND anonymous_username ~ (username_prefix || '[0-9]+$');
  
  -- Create the new username
  new_username := username_prefix || '#' || next_number;
  
  RETURN new_username;
END;
$$;
-- Create user preferences table for privacy and notification settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Privacy Settings
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'network', 'private')),
  search_visibility BOOLEAN NOT NULL DEFAULT true,
  direct_invite_only BOOLEAN NOT NULL DEFAULT false,
  
  -- Email Notification Settings
  email_new_messages BOOLEAN NOT NULL DEFAULT true,
  email_new_connections BOOLEAN NOT NULL DEFAULT true,
  email_feedback_received BOOLEAN NOT NULL DEFAULT true,
  email_weekly_digest BOOLEAN NOT NULL DEFAULT false,
  email_community_activity BOOLEAN NOT NULL DEFAULT false,
  
  -- Push Notification Settings
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  push_new_messages BOOLEAN NOT NULL DEFAULT false,
  push_network_updates BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences" 
ON public.user_preferences 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get or create user preferences
CREATE OR REPLACE FUNCTION public.get_or_create_user_preferences(target_user_id UUID)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefs public.user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO prefs 
  FROM public.user_preferences 
  WHERE user_id = target_user_id;
  
  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (target_user_id)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$$;
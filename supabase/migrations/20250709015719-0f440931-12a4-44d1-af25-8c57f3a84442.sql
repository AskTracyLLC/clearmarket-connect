-- Create user profiles table for extended user information
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  join_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user invitations table to track sent invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  invited_by UUID NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_invitations
CREATE POLICY "Admins can view all invitations" 
ON public.user_invitations 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can create invitations" 
ON public.user_invitations 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can update invitations" 
ON public.user_invitations 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_invitations_updated_at
BEFORE UPDATE ON public.user_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle user activation/deactivation
CREATE OR REPLACE FUNCTION public.toggle_user_activation(target_user_id UUID, is_active_param BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF get_user_role(auth.uid()) != 'admin'::user_role THEN
    RETURN false;
  END IF;
  
  -- Update user profile activation status
  UPDATE public.user_profiles
  SET is_active = is_active_param, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- If deactivating, we could add logic here to revoke sessions
  -- For now, just return success
  RETURN true;
END;
$$;
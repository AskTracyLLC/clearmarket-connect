-- Create enums for constrained fields
CREATE TYPE user_role AS ENUM ('field_rep', 'vendor', 'moderator', 'admin');
CREATE TYPE unlock_method AS ENUM ('credit', 'referral', 'purchase');
CREATE TYPE flag_target_type AS ENUM ('profile', 'post', 'comment');
CREATE TYPE flag_status AS ENUM ('pending', 'reviewed', 'dismissed');

-- Create users table (extended profile)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'field_rep',
  display_name TEXT,
  profile_complete INTEGER DEFAULT 0 CHECK (profile_complete >= 0 AND profile_complete <= 100),
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  community_score INTEGER DEFAULT 0 CHECK (community_score >= 0 AND community_score <= 100),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referred_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credits table
CREATE TABLE public.credits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  current_balance INTEGER DEFAULT 0 CHECK (current_balance >= 0),
  earned_credits INTEGER DEFAULT 0 CHECK (earned_credits >= 0),
  paid_credits INTEGER DEFAULT 0 CHECK (paid_credits >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_unlocks table
CREATE TABLE public.contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unlocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  unlocked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  method unlock_method NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referee_email TEXT NOT NULL,
  joined_user_id UUID REFERENCES public.users(id),
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flags table
CREATE TABLE public.flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flagged_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type flag_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  status flag_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  helpful_votes INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_comments table
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  helpful_votes INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to get user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.credits (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_credits_updated_at
  BEFORE UPDATE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.users
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for credits table
CREATE POLICY "Users can view own credits" ON public.credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits" ON public.credits
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update own credits" ON public.credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any credits" ON public.credits
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can insert own credits" ON public.credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for contact_unlocks table
CREATE POLICY "Users can view own unlocks" ON public.contact_unlocks
  FOR SELECT USING (auth.uid() = unlocker_id OR auth.uid() = unlocked_user_id);

CREATE POLICY "Admins can view all unlocks" ON public.contact_unlocks
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create unlocks" ON public.contact_unlocks
  FOR INSERT WITH CHECK (auth.uid() = unlocker_id);

-- RLS Policies for referrals table
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = joined_user_id);

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- RLS Policies for flags table
CREATE POLICY "Users can view own flags" ON public.flags
  FOR SELECT USING (auth.uid() = flagged_by);

CREATE POLICY "Moderators and admins can view all flags" ON public.flags
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Users can create flags" ON public.flags
  FOR INSERT WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Moderators and admins can update flags" ON public.flags
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

-- RLS Policies for community_posts table
CREATE POLICY "Everyone can view posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Moderators and admins can update any post" ON public.community_posts
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Moderators and admins can delete posts" ON public.community_posts
  FOR DELETE USING (public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

-- RLS Policies for community_comments table
CREATE POLICY "Everyone can view comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Moderators and admins can update any comment" ON public.community_comments
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Moderators and admins can delete comments" ON public.community_comments
  FOR DELETE USING (public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_referred_by ON public.users(referred_by);
CREATE INDEX idx_contact_unlocks_unlocker ON public.contact_unlocks(unlocker_id);
CREATE INDEX idx_contact_unlocks_unlocked ON public.contact_unlocks(unlocked_user_id);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_flags_target ON public.flags(target_type, target_id);
CREATE INDEX idx_flags_status ON public.flags(status);
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_user ON public.community_comments(user_id);
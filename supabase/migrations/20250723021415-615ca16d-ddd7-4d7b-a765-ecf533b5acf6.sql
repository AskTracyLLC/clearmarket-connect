-- Fix missing relationships and add missing tables for community features

-- First, add the missing tables for community interactions
CREATE TABLE IF NOT EXISTS public.helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(target_id, target_type, voter_id)
);

CREATE TABLE IF NOT EXISTS public.flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  flagged_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(target_id, target_type, flagged_by)
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.funny_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(target_id, target_type, voter_id)
);

-- Add funny_votes column to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS funny_votes INTEGER NOT NULL DEFAULT 0;

-- Enable RLS for all new tables
ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funny_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for helpful_votes
CREATE POLICY "Users can create helpful votes" ON public.helpful_votes
FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Anyone can view helpful votes" ON public.helpful_votes
FOR SELECT USING (true);

CREATE POLICY "Users can delete own helpful votes" ON public.helpful_votes
FOR DELETE USING (auth.uid() = voter_id);

-- Create policies for flags
CREATE POLICY "Users can create flags" ON public.flags
FOR INSERT WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins can view all flags" ON public.flags
FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create policies for saved_posts
CREATE POLICY "Users can manage own saved posts" ON public.saved_posts
FOR ALL USING (auth.uid() = user_id);

-- Create policies for funny_votes
CREATE POLICY "Users can create funny votes" ON public.funny_votes
FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Anyone can view funny votes" ON public.funny_votes
FOR SELECT USING (true);

CREATE POLICY "Users can delete own funny votes" ON public.funny_votes
FOR DELETE USING (auth.uid() = voter_id);
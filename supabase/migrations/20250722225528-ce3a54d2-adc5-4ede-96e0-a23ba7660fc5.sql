-- Create giveaway tables for the dual currency system

-- Monthly giveaways table
CREATE TABLE public.monthly_giveaways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize_description TEXT NOT NULL,
  prize_value NUMERIC,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_cost_rep_points INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
  total_entries INTEGER NOT NULL DEFAULT 0,
  sponsor_type TEXT NOT NULL DEFAULT 'clearmarket' CHECK (sponsor_type IN ('clearmarket', 'external_company', 'vendor')),
  winner_id UUID,
  drawing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vendor network giveaways table
CREATE TABLE public.vendor_network_giveaways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize_description TEXT NOT NULL,
  entry_cost_rep_points INTEGER NOT NULL DEFAULT 5,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_entries_per_user INTEGER NOT NULL DEFAULT 999,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
  total_entries INTEGER NOT NULL DEFAULT 0,
  network_size INTEGER NOT NULL DEFAULT 0,
  winner_id UUID,
  drawing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Giveaway entries table (for monthly giveaways)
CREATE TABLE public.giveaway_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.monthly_giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  entry_count INTEGER NOT NULL DEFAULT 1,
  rep_points_spent INTEGER NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

-- Vendor giveaway entries table
CREATE TABLE public.vendor_giveaway_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.vendor_network_giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  entry_count INTEGER NOT NULL DEFAULT 1,
  rep_points_spent INTEGER NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

-- Enable RLS on all giveaway tables
ALTER TABLE public.monthly_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_network_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_giveaway_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly_giveaways
CREATE POLICY "Everyone can view active monthly giveaways" 
ON public.monthly_giveaways 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage monthly giveaways" 
ON public.monthly_giveaways 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS policies for vendor_network_giveaways
CREATE POLICY "Network members can view vendor giveaways" 
ON public.vendor_network_giveaways 
FOR SELECT 
USING (
  status = 'active' AND 
  EXISTS (
    SELECT 1 FROM public.contact_unlocks 
    WHERE (unlocker_id = auth.uid() AND unlocked_user_id = vendor_id)
       OR (unlocked_user_id = auth.uid() AND unlocker_id = vendor_id)
  )
);

CREATE POLICY "Vendors can manage own giveaways" 
ON public.vendor_network_giveaways 
FOR ALL 
USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage all vendor giveaways" 
ON public.vendor_network_giveaways 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS policies for giveaway_entries
CREATE POLICY "Users can view own giveaway entries" 
ON public.giveaway_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create giveaway entries" 
ON public.giveaway_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" 
ON public.giveaway_entries 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS policies for vendor_giveaway_entries
CREATE POLICY "Users can view own vendor giveaway entries" 
ON public.vendor_giveaway_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create vendor giveaway entries" 
ON public.vendor_giveaway_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can view entries for their giveaways" 
ON public.vendor_giveaway_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_network_giveaways 
    WHERE id = giveaway_id AND vendor_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all vendor entries" 
ON public.vendor_giveaway_entries 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create indexes for better performance
CREATE INDEX idx_monthly_giveaways_status ON public.monthly_giveaways(status);
CREATE INDEX idx_monthly_giveaways_dates ON public.monthly_giveaways(start_date, end_date);
CREATE INDEX idx_vendor_giveaways_vendor ON public.vendor_network_giveaways(vendor_id);
CREATE INDEX idx_vendor_giveaways_status ON public.vendor_network_giveaways(status);
CREATE INDEX idx_giveaway_entries_user ON public.giveaway_entries(user_id);
CREATE INDEX idx_vendor_entries_user ON public.vendor_giveaway_entries(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_monthly_giveaways_updated_at
  BEFORE UPDATE ON public.monthly_giveaways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vendor_giveaways_updated_at
  BEFORE UPDATE ON public.vendor_network_giveaways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
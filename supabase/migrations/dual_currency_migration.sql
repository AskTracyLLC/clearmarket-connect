-- Dual Currency System Migration
-- Adds RepPoints and separates from ClearCredits

-- Add RepPoints column to existing credits table
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS rep_points INTEGER DEFAULT 0;

-- Add currency type to credit_transactions
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS currency_type TEXT DEFAULT 'clear_credits';

-- Update existing earned transactions to be RepPoints
UPDATE public.credit_transactions 
SET currency_type = 'rep_points' 
WHERE transaction_type = 'earned';

-- Create monthly giveaways table
CREATE TABLE IF NOT EXISTS public.monthly_giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prize_value DECIMAL(10,2),
  prize_description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  entry_cost_rep_points INTEGER NOT NULL DEFAULT 5,
  sponsor_id UUID REFERENCES public.users(id),
  sponsor_type TEXT NOT NULL DEFAULT 'clearmarket', -- 'clearmarket', 'external_company', 'vendor'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'ended', 'cancelled'
  winner_id UUID REFERENCES public.users(id),
  total_entries INTEGER DEFAULT 0,
  drawing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create giveaway entries table
CREATE TABLE IF NOT EXISTS public.giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.monthly_giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_count INTEGER NOT NULL DEFAULT 1,
  rep_points_spent INTEGER NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(giveaway_id, user_id) -- One entry record per user per giveaway
);

-- Create vendor network giveaways table
CREATE TABLE IF NOT EXISTS public.vendor_network_giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prize_description TEXT NOT NULL,
  entry_cost_rep_points INTEGER NOT NULL DEFAULT 3,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_entries_per_user INTEGER DEFAULT 10,
  eligibility_rules JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'ended', 'cancelled'
  winner_id UUID REFERENCES public.users(id),
  total_entries INTEGER DEFAULT 0,
  network_size INTEGER DEFAULT 0,
  drawing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vendor giveaway entries table
CREATE TABLE IF NOT EXISTS public.vendor_giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.vendor_network_giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_count INTEGER NOT NULL DEFAULT 1,
  rep_points_spent INTEGER NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(giveaway_id, user_id) -- One entry record per user per giveaway
);

-- Enable RLS on new tables
ALTER TABLE public.monthly_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_network_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_giveaway_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monthly_giveaways
CREATE POLICY "Everyone can view active giveaways" 
ON public.monthly_giveaways 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage all giveaways" 
ON public.monthly_giveaways 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for giveaway_entries
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
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for vendor_network_giveaways
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

-- RLS Policies for vendor_giveaway_entries
CREATE POLICY "Users can view own vendor entries" 
ON public.vendor_giveaway_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Network members can create entries" 
ON public.vendor_giveaway_entries 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.vendor_network_giveaways vng
    JOIN public.contact_unlocks cu ON (
      (cu.unlocker_id = auth.uid() AND cu.unlocked_user_id = vng.vendor_id)
      OR (cu.unlocked_user_id = auth.uid() AND cu.unlocker_id = vng.vendor_id)
    )
    WHERE vng.id = giveaway_id AND vng.status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_giveaways_status ON public.monthly_giveaways(status);
CREATE INDEX IF NOT EXISTS idx_monthly_giveaways_dates ON public.monthly_giveaways(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_giveaway ON public.giveaway_entries(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_user ON public.giveaway_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_giveaways_vendor ON public.vendor_network_giveaways(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_giveaways_status ON public.vendor_network_giveaways(status);
CREATE INDEX IF NOT EXISTS idx_vendor_entries_giveaway ON public.vendor_giveaway_entries(giveaway_id);

-- Add updated_at triggers
CREATE TRIGGER update_monthly_giveaways_updated_at
BEFORE UPDATE ON public.monthly_giveaways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_giveaways_updated_at
BEFORE UPDATE ON public.vendor_network_giveaways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
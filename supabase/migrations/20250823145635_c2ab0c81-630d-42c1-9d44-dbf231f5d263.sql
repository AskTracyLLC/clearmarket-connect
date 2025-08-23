-- Create coverage_areas table to store field rep coverage areas and pricing
CREATE TABLE IF NOT EXISTS public.coverage_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  counties TEXT[] NOT NULL DEFAULT '{}',
  is_all_counties BOOLEAN NOT NULL DEFAULT false,
  standard_price TEXT NOT NULL,
  rush_price TEXT NOT NULL,
  inspection_types JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  anonymous_username TEXT
);

-- Enable Row Level Security
ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for coverage areas
CREATE POLICY "Users can create own coverage areas" 
ON public.coverage_areas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own coverage areas" 
ON public.coverage_areas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own coverage areas" 
ON public.coverage_areas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coverage areas" 
ON public.coverage_areas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_coverage_areas_updated_at
  BEFORE UPDATE ON public.coverage_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add anonymous username sync trigger
CREATE TRIGGER sync_coverage_areas_anonymous_username
  BEFORE INSERT OR UPDATE ON public.coverage_areas
  FOR EACH ROW
  EXECUTE FUNCTION sync_anonymous_username_for_user_id();
-- Create table for ZIP/County Rural-Urban classification data
CREATE TABLE public.zip_county_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zip_code TEXT NOT NULL,
  state TEXT NOT NULL,
  county_name TEXT NOT NULL,
  rural_urban_designation TEXT NOT NULL CHECK (rural_urban_designation IN ('Rural', 'Urban')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(zip_code)
);

-- Enable Row Level Security
ALTER TABLE public.zip_county_classifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all classifications" 
ON public.zip_county_classifications 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can create classifications" 
ON public.zip_county_classifications 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can update classifications" 
ON public.zip_county_classifications 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can delete classifications" 
ON public.zip_county_classifications 
FOR DELETE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create indexes for better performance
CREATE INDEX idx_zip_county_classifications_zip_code ON public.zip_county_classifications(zip_code);
CREATE INDEX idx_zip_county_classifications_state ON public.zip_county_classifications(state);
CREATE INDEX idx_zip_county_classifications_county_name ON public.zip_county_classifications(county_name);
CREATE INDEX idx_zip_county_classifications_rural_urban ON public.zip_county_classifications(rural_urban_designation);

-- Create function to update timestamps
CREATE TRIGGER update_zip_county_classifications_updated_at
BEFORE UPDATE ON public.zip_county_classifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
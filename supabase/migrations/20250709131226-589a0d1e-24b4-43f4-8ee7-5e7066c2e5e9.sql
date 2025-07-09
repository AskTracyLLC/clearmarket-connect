-- Create normalized location tables to replace mock data

-- 1. Create states table
CREATE TABLE public.states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create counties table
CREATE TABLE public.counties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, state_id)
);

-- 3. Create zip_codes table (normalized from zip_county_classifications)
CREATE TABLE public.zip_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zip_code TEXT NOT NULL UNIQUE,
  county_id UUID NOT NULL REFERENCES public.counties(id) ON DELETE CASCADE,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  rural_urban_designation TEXT NOT NULL CHECK (rural_urban_designation IN ('Rural', 'Urban')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zip_codes ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public read access (needed for dropdowns and filters)
CREATE POLICY "Everyone can view states" 
ON public.states 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can view counties" 
ON public.counties 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can view zip codes" 
ON public.zip_codes 
FOR SELECT 
USING (true);

-- 6. Create admin policies for data management
CREATE POLICY "Admins can manage states" 
ON public.states 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can manage counties" 
ON public.counties 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can manage zip codes" 
ON public.zip_codes 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- 7. Create indexes for better performance
CREATE INDEX idx_counties_state_id ON public.counties(state_id);
CREATE INDEX idx_zip_codes_county_id ON public.zip_codes(county_id);
CREATE INDEX idx_zip_codes_state_id ON public.zip_codes(state_id);
CREATE INDEX idx_zip_codes_zip_code ON public.zip_codes(zip_code);
CREATE INDEX idx_zip_codes_rural_urban ON public.zip_codes(rural_urban_designation);

-- 8. Create triggers for automatic timestamp updates
CREATE TRIGGER update_states_updated_at
BEFORE UPDATE ON public.states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counties_updated_at
BEFORE UPDATE ON public.counties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zip_codes_updated_at
BEFORE UPDATE ON public.zip_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create function to populate normalized tables from CSV data
CREATE OR REPLACE FUNCTION public.populate_location_data_from_csv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  csv_record RECORD;
  state_id_var UUID;
  county_id_var UUID;
BEGIN
  -- Clear existing normalized data
  DELETE FROM public.zip_codes;
  DELETE FROM public.counties;
  DELETE FROM public.states;
  
  -- Loop through zip_county_classifications and normalize the data
  FOR csv_record IN 
    SELECT DISTINCT state, county_name, zip_code, rural_urban_designation 
    FROM public.zip_county_classifications 
    ORDER BY state, county_name, zip_code
  LOOP
    -- Insert or get state
    INSERT INTO public.states (name, code)
    SELECT 
      CASE csv_record.state
        WHEN 'AL' THEN 'Alabama'
        WHEN 'AK' THEN 'Alaska'
        WHEN 'AZ' THEN 'Arizona'
        WHEN 'AR' THEN 'Arkansas'
        WHEN 'CA' THEN 'California'
        WHEN 'CO' THEN 'Colorado'
        WHEN 'CT' THEN 'Connecticut'
        WHEN 'DE' THEN 'Delaware'
        WHEN 'FL' THEN 'Florida'
        WHEN 'GA' THEN 'Georgia'
        WHEN 'HI' THEN 'Hawaii'
        WHEN 'ID' THEN 'Idaho'
        WHEN 'IL' THEN 'Illinois'
        WHEN 'IN' THEN 'Indiana'
        WHEN 'IA' THEN 'Iowa'
        WHEN 'KS' THEN 'Kansas'
        WHEN 'KY' THEN 'Kentucky'
        WHEN 'LA' THEN 'Louisiana'
        WHEN 'ME' THEN 'Maine'
        WHEN 'MD' THEN 'Maryland'
        WHEN 'MA' THEN 'Massachusetts'
        WHEN 'MI' THEN 'Michigan'
        WHEN 'MN' THEN 'Minnesota'
        WHEN 'MS' THEN 'Mississippi'
        WHEN 'MO' THEN 'Missouri'
        WHEN 'MT' THEN 'Montana'
        WHEN 'NE' THEN 'Nebraska'
        WHEN 'NV' THEN 'Nevada'
        WHEN 'NH' THEN 'New Hampshire'
        WHEN 'NJ' THEN 'New Jersey'
        WHEN 'NM' THEN 'New Mexico'
        WHEN 'NY' THEN 'New York'
        WHEN 'NC' THEN 'North Carolina'
        WHEN 'ND' THEN 'North Dakota'
        WHEN 'OH' THEN 'Ohio'
        WHEN 'OK' THEN 'Oklahoma'
        WHEN 'OR' THEN 'Oregon'
        WHEN 'PA' THEN 'Pennsylvania'
        WHEN 'RI' THEN 'Rhode Island'
        WHEN 'SC' THEN 'South Carolina'
        WHEN 'SD' THEN 'South Dakota'
        WHEN 'TN' THEN 'Tennessee'
        WHEN 'TX' THEN 'Texas'
        WHEN 'UT' THEN 'Utah'
        WHEN 'VT' THEN 'Vermont'
        WHEN 'VA' THEN 'Virginia'
        WHEN 'WA' THEN 'Washington'
        WHEN 'WV' THEN 'West Virginia'
        WHEN 'WI' THEN 'Wisconsin'
        WHEN 'WY' THEN 'Wyoming'
        WHEN 'DC' THEN 'District of Columbia'
        WHEN 'PR' THEN 'Puerto Rico'
        WHEN 'VI' THEN 'Virgin Islands'
        WHEN 'AS' THEN 'American Samoa'
        WHEN 'GU' THEN 'Guam'
        WHEN 'MP' THEN 'Northern Mariana Islands'
        ELSE csv_record.state
      END,
      csv_record.state
    ON CONFLICT (code) DO NOTHING;
    
    -- Get state ID
    SELECT id INTO state_id_var 
    FROM public.states 
    WHERE code = csv_record.state;
    
    -- Insert or get county
    INSERT INTO public.counties (name, state_id)
    VALUES (csv_record.county_name, state_id_var)
    ON CONFLICT (name, state_id) DO NOTHING;
    
    -- Get county ID
    SELECT id INTO county_id_var 
    FROM public.counties 
    WHERE name = csv_record.county_name AND state_id = state_id_var;
    
    -- Insert zip code
    INSERT INTO public.zip_codes (zip_code, county_id, state_id, rural_urban_designation)
    VALUES (csv_record.zip_code, county_id_var, state_id_var, csv_record.rural_urban_designation)
    ON CONFLICT (zip_code) DO UPDATE SET
      county_id = EXCLUDED.county_id,
      state_id = EXCLUDED.state_id,
      rural_urban_designation = EXCLUDED.rural_urban_designation,
      updated_at = now();
  END LOOP;
END;
$$;
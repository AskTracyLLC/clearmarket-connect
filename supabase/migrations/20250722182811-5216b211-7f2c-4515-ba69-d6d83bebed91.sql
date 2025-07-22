-- Create work_types table for system-wide work type management
CREATE TABLE IF NOT EXISTS public.work_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on work_types table
ALTER TABLE public.work_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_types
CREATE POLICY "Everyone can view active work types" 
ON public.work_types 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all work types" 
ON public.work_types 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create platform_work_type_mappings table to define which platforms work with which work types
CREATE TABLE IF NOT EXISTS public.platform_work_type_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  work_type_id UUID NOT NULL REFERENCES public.work_types(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(platform_id, work_type_id)
);

-- Enable RLS on platform_work_type_mappings table
ALTER TABLE public.platform_work_type_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_work_type_mappings
CREATE POLICY "Everyone can view active mappings" 
ON public.platform_work_type_mappings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all mappings" 
ON public.platform_work_type_mappings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add updated_at trigger for work_types
CREATE TRIGGER update_work_types_updated_at
BEFORE UPDATE ON public.work_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default work types based on existing inspection types
INSERT INTO public.work_types (name, description, display_order, is_active) VALUES
('Interior/Exterior Inspections', 'Complete property inspections including interior and exterior areas', 1, true),
('Exterior Only Inspections', 'Property inspections focusing on exterior areas only', 2, true),
('Drive-by Inspections', 'Quick drive-by property assessments', 3, true),
('Occupancy Verification', 'Verification of property occupancy status', 4, true),
('REO Services', 'Real Estate Owned (REO) property services', 5, true),
('Property Preservation', 'Property maintenance and preservation services', 6, true),
('Damage Assessment', 'Assessment of property damage for insurance or lending purposes', 7, true),
('High Quality Marketing Photos', 'Professional photography for property marketing', 8, true),
('Appt-Based Inspections', 'Inspections requiring scheduled appointments', 9, true)
ON CONFLICT (name) DO NOTHING;

-- Get platform and work type IDs for creating mappings
DO $$
DECLARE
    ezinspections_id UUID;
    inspectorade_id UUID;
    safeview_id UUID;
    worldapp_id UUID;
    other_id UUID;
    
    interior_exterior_id UUID;
    exterior_only_id UUID;
    drive_by_id UUID;
    occupancy_id UUID;
    reo_id UUID;
    preservation_id UUID;
    damage_id UUID;
    photos_id UUID;
    appt_based_id UUID;
BEGIN
    -- Get platform IDs
    SELECT id INTO ezinspections_id FROM public.platforms WHERE name = 'EZinspections';
    SELECT id INTO inspectorade_id FROM public.platforms WHERE name = 'InspectorADE';
    SELECT id INTO safeview_id FROM public.platforms WHERE name = 'SafeView';
    SELECT id INTO worldapp_id FROM public.platforms WHERE name = 'WorldAPP';
    SELECT id INTO other_id FROM public.platforms WHERE name = 'Other';
    
    -- Get work type IDs
    SELECT id INTO interior_exterior_id FROM public.work_types WHERE name = 'Interior/Exterior Inspections';
    SELECT id INTO exterior_only_id FROM public.work_types WHERE name = 'Exterior Only Inspections';
    SELECT id INTO drive_by_id FROM public.work_types WHERE name = 'Drive-by Inspections';
    SELECT id INTO occupancy_id FROM public.work_types WHERE name = 'Occupancy Verification';
    SELECT id INTO reo_id FROM public.work_types WHERE name = 'REO Services';
    SELECT id INTO preservation_id FROM public.work_types WHERE name = 'Property Preservation';
    SELECT id INTO damage_id FROM public.work_types WHERE name = 'Damage Assessment';
    SELECT id INTO photos_id FROM public.work_types WHERE name = 'High Quality Marketing Photos';
    SELECT id INTO appt_based_id FROM public.work_types WHERE name = 'Appt-Based Inspections';

    -- Create platform-work type mappings based on real-world usage
    -- EZinspections - supports most inspection types
    IF ezinspections_id IS NOT NULL THEN
        INSERT INTO public.platform_work_type_mappings (platform_id, work_type_id) VALUES
        (ezinspections_id, interior_exterior_id),
        (ezinspections_id, exterior_only_id),
        (ezinspections_id, occupancy_id),
        (ezinspections_id, reo_id),
        (ezinspections_id, damage_id),
        (ezinspections_id, appt_based_id)
        ON CONFLICT (platform_id, work_type_id) DO NOTHING;
    END IF;

    -- InspectorADE - focuses on specific inspection types
    IF inspectorade_id IS NOT NULL THEN
        INSERT INTO public.platform_work_type_mappings (platform_id, work_type_id) VALUES
        (inspectorade_id, interior_exterior_id),
        (inspectorade_id, exterior_only_id),
        (inspectorade_id, occupancy_id),
        (inspectorade_id, damage_id)
        ON CONFLICT (platform_id, work_type_id) DO NOTHING;
    END IF;

    -- SafeView - specialized in safety and preservation
    IF safeview_id IS NOT NULL THEN
        INSERT INTO public.platform_work_type_mappings (platform_id, work_type_id) VALUES
        (safeview_id, exterior_only_id),
        (safeview_id, drive_by_id),
        (safeview_id, preservation_id),
        (safeview_id, damage_id)
        ON CONFLICT (platform_id, work_type_id) DO NOTHING;
    END IF;

    -- WorldAPP - global platform with broad coverage except occupancy
    IF worldapp_id IS NOT NULL THEN
        INSERT INTO public.platform_work_type_mappings (platform_id, work_type_id) VALUES
        (worldapp_id, interior_exterior_id),
        (worldapp_id, exterior_only_id),
        (worldapp_id, drive_by_id),
        (worldapp_id, reo_id),
        (worldapp_id, preservation_id),
        (worldapp_id, damage_id),
        (worldapp_id, photos_id),
        (worldapp_id, appt_based_id)
        ON CONFLICT (platform_id, work_type_id) DO NOTHING;
    END IF;

    -- Other - can be used for any work type
    IF other_id IS NOT NULL THEN
        INSERT INTO public.platform_work_type_mappings (platform_id, work_type_id) VALUES
        (other_id, interior_exterior_id),
        (other_id, exterior_only_id),
        (other_id, drive_by_id),
        (other_id, occupancy_id),
        (other_id, reo_id),
        (other_id, preservation_id),
        (other_id, damage_id),
        (other_id, photos_id),
        (other_id, appt_based_id)
        ON CONFLICT (platform_id, work_type_id) DO NOTHING;
    END IF;

END $$;
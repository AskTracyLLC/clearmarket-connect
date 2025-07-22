-- Create platforms table for system-wide platform management
CREATE TABLE IF NOT EXISTS public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'inspection' CHECK (category IN ('inspection', 'communication', 'reporting', 'other')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on platforms table
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- RLS policies for platforms
CREATE POLICY "Everyone can view active platforms" 
ON public.platforms 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all platforms" 
ON public.platforms 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add updated_at trigger
CREATE TRIGGER update_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platforms based on existing system data
INSERT INTO public.platforms (name, description, category, display_order, is_active) VALUES
('EZinspections', 'EZ Inspections platform for property inspections', 'inspection', 1, true),
('InspectorADE', 'Inspector ADE platform for automated inspections', 'inspection', 2, true),
('SafeView', 'SafeView platform for safety inspections', 'inspection', 3, true),
('WorldAPP', 'WorldAPP platform for global inspection services', 'inspection', 4, true),
('Other', 'Other platforms not listed above', 'other', 99, true)
ON CONFLICT (name) DO NOTHING;
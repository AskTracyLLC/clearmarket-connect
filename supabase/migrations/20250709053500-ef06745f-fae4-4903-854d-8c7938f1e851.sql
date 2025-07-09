-- Add system settings to control homepage sections visibility
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('testimonials_section_visible', 'true'::jsonb, 'boolean', 'Show/hide the testimonials section on homepage', 'ui', true),
('success_stories_section_visible', 'true'::jsonb, 'boolean', 'Show/hide the success stories section on homepage', 'ui', true);
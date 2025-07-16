-- Create discussion templates table
CREATE TABLE IF NOT EXISTS discussion_templates (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'question',
  tags TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheduled discussion posts table
CREATE TABLE IF NOT EXISTS scheduled_discussion_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id) NOT NULL,
  discussion_template_id TEXT REFERENCES discussion_templates(id) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'posted', 'skipped', 'conflict_detected'
  conflict_post_id UUID REFERENCES community_posts(id),
  conflict_reason TEXT,
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_post_id UUID REFERENCES community_posts(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheduler settings table
CREATE TABLE IF NOT EXISTS scheduler_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'bi-weekly'
  preferred_days INTEGER[] DEFAULT '{1,3}', -- Monday=1, Wednesday=3
  preferred_time TIME DEFAULT '09:00',
  max_posts_per_week INTEGER DEFAULT 2,
  conflict_detection_enabled BOOLEAN DEFAULT true,
  lookback_days INTEGER DEFAULT 14,
  similarity_threshold DECIMAL DEFAULT 0.3,
  conflict_action TEXT DEFAULT 'skip', -- 'skip', 'link', 'ask', 'post_anyway'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

-- Enable RLS on new tables
ALTER TABLE discussion_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for discussion_templates
CREATE POLICY "Admins can manage discussion templates" ON discussion_templates
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS policies for scheduled_discussion_posts
CREATE POLICY "Admins can manage scheduled posts" ON scheduled_discussion_posts
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS policies for scheduler_settings
CREATE POLICY "Admins can manage scheduler settings" ON scheduler_settings
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create triggers for updated_at
CREATE TRIGGER update_discussion_templates_updated_at
BEFORE UPDATE ON discussion_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_discussion_posts_updated_at
BEFORE UPDATE ON scheduled_discussion_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduler_settings_updated_at
BEFORE UPDATE ON scheduler_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default discussion templates
INSERT INTO discussion_templates (id, category, title, content, post_type, tags, priority) VALUES
('winter-safety', 'Safety', 'Winter Safety Best Practices', 'With winter weather approaching, what are your go-to safety protocols for cold weather inspections? Share your tips for staying safe in freezing conditions, dealing with icy properties, and maintaining equipment in harsh weather.', 'question', '{safety, winter, weather, best-practices}', 8),
('occupied-properties', 'Process', 'Handling Occupied Properties', 'You arrive at a property and find unexpected occupants - what''s your process? Let''s discuss best practices for handling occupied properties professionally and safely.', 'discussion', '{process, occupied, safety, professional}', 7),
('documentation-standards', 'Documentation', 'Essential Documentation Practices', 'What documentation do you find most important for REO work? Share your systems for organizing reports, photos, and communications to ensure nothing falls through the cracks.', 'question', '{documentation, reo, organization, reports}', 6),
('software-tips', 'Technology', 'Inspection Software Best Practices', 'What are your favorite features and workflows in different inspection software platforms? Share tips, tricks, and efficiency hacks that have improved your workflow.', 'discussion', '{software, technology, efficiency, workflow}', 5),
('payment-protocols', 'Business', 'Professional Payment Follow-up', 'Payment is 60+ days late - what steps do you take? Let''s discuss professional approaches to payment follow-up that maintain relationships while protecting your business.', 'question', '{payment, business, professional, finance}', 7),
('quality-standards', 'Quality', 'Photo Quality and Retake Requests', 'Client wants photos retaken due to quality concerns - how do you handle it? Share your quality standards and how you manage client feedback professionally.', 'discussion', '{quality, photos, client-relations, standards}', 6),
('regional-challenges', 'Regional', 'Regional Market Insights', 'What unique challenges and opportunities are you seeing in your regional market? Share insights about local regulations, seasonal patterns, and market conditions.', 'discussion', '{regional, market, insights, local}', 5),
('safety-hazards', 'Safety', 'Property Safety Hazard Protocols', 'Property has obvious safety hazards - what are your protocols? Discuss how to document, report, and handle dangerous conditions while keeping yourself and others safe.', 'question', '{safety, hazards, protocols, documentation}', 9);

-- Insert default scheduler settings
INSERT INTO scheduler_settings (
  frequency, 
  preferred_days, 
  preferred_time, 
  max_posts_per_week,
  conflict_detection_enabled,
  lookback_days,
  similarity_threshold,
  conflict_action
) VALUES (
  'weekly',
  '{1,4}', -- Monday and Thursday
  '09:00',
  2,
  true,
  14,
  0.3,
  'skip'
) ON CONFLICT DO NOTHING;
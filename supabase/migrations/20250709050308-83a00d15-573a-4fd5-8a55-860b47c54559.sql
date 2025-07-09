
-- Create system_templates table for email template management
CREATE TABLE public.system_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- email, sms, notification
  subject TEXT,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB, -- stores template variable definitions
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id),
  last_modified_by UUID REFERENCES public.users(id)
);

-- Create internal_users table for non-market user tracking
CREATE TABLE public.internal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL, -- qa, partner, investor, support
  notes TEXT,
  access_expiration TIMESTAMP WITH TIME ZONE,
  invite_sent BOOLEAN NOT NULL DEFAULT false,
  profile_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Create system_settings table for global toggles and configurations
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL, -- boolean, string, number, json
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- general, features, maintenance, ui
  is_public BOOLEAN NOT NULL DEFAULT false, -- whether setting can be viewed by non-admins
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users(id)
);

-- Create moderation_actions table for tracking admin decisions
CREATE TABLE public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL REFERENCES public.users(id),
  target_type TEXT NOT NULL, -- post, comment, user, review
  target_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- approve, reject, hide, warn, suspend, delete
  reason TEXT,
  notes TEXT,
  metadata JSONB, -- additional action-specific data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.system_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_templates
CREATE POLICY "Admins can manage all templates" 
ON public.system_templates 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can use templates" 
ON public.system_templates 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for internal_users
CREATE POLICY "Admins can manage internal users" 
ON public.internal_users 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for system_settings
CREATE POLICY "Admins can manage all settings" 
ON public.system_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view public settings" 
ON public.system_settings 
FOR SELECT 
USING (is_public = true OR get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'moderator'::user_role]));

-- RLS Policies for moderation_actions
CREATE POLICY "Moderators can create actions" 
ON public.moderation_actions 
FOR INSERT 
WITH CHECK (
  auth.uid() = moderator_id AND 
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'moderator'::user_role])
);

CREATE POLICY "Moderators can view all actions" 
ON public.moderation_actions 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'moderator'::user_role]));

-- Add triggers for updated_at columns
CREATE TRIGGER update_system_templates_updated_at
BEFORE UPDATE ON public.system_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_users_updated_at
BEFORE UPDATE ON public.internal_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('search_enabled', 'true', 'boolean', 'Enable/disable search functionality', 'features', true),
('unlock_enabled', 'true', 'boolean', 'Enable/disable contact unlock feature', 'features', false),
('boost_enabled', 'true', 'boolean', 'Enable/disable boost functionality', 'features', false),
('show_sample_data', 'true', 'boolean', 'Show sample/test data in search results', 'features', false),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'maintenance', true),
('maintenance_message', '"System maintenance in progress. Please check back later."', 'string', 'Maintenance mode message', 'maintenance', true),
('global_announcement', '""', 'string', 'Global announcement banner text', 'ui', true),
('announcement_enabled', 'false', 'boolean', 'Show global announcement banner', 'ui', true),
('max_flag_threshold', '5', 'number', 'Number of flags before auto-hiding content', 'features', false);

-- Insert default email templates
INSERT INTO public.system_templates (template_name, template_type, subject, html_content, text_content, variables) VALUES
('unlock_confirmation', 'email', 'Contact Information Unlocked', 
'<h1>Contact Unlocked Successfully!</h1><p>Hi {{unlocker_name}},</p><p>You have successfully unlocked contact information for <strong>{{rep_name}}</strong>.</p><p><strong>Contact Details:</strong></p><ul><li>Email: {{contact_email}}</li><li>Phone: {{contact_phone}}</li></ul><p>Credits used: {{credits_used}}</p>',
'Contact Unlocked Successfully!\n\nHi {{unlocker_name}},\n\nYou have successfully unlocked contact information for {{rep_name}}.\n\nContact Details:\nEmail: {{contact_email}}\nPhone: {{contact_phone}}\n\nCredits used: {{credits_used}}',
'["unlocker_name", "rep_name", "contact_email", "contact_phone", "credits_used"]'::jsonb),

('welcome_email', 'email', 'Welcome to ClearMarket!', 
'<h1>Welcome to ClearMarket!</h1><p>Hi {{user_name}},</p><p>Thank you for joining ClearMarket. Your account is now active and ready to use.</p><p>Get started by completing your profile and exploring the platform.</p>',
'Welcome to ClearMarket!\n\nHi {{user_name}},\n\nThank you for joining ClearMarket. Your account is now active and ready to use.\n\nGet started by completing your profile and exploring the platform.',
'["user_name"]'::jsonb),

('review_posted_alert', 'email', 'New Review Posted', 
'<h1>Review Posted</h1><p>Hi {{reviewed_user_name}},</p><p>A new review has been posted for your profile by {{reviewer_name}}.</p><p>Rating: {{rating}}/5 stars</p><p>Review: {{review_text}}</p>',
'Review Posted\n\nHi {{reviewed_user_name}},\n\nA new review has been posted for your profile by {{reviewer_name}}.\n\nRating: {{rating}}/5 stars\nReview: {{review_text}}',
'["reviewed_user_name", "reviewer_name", "rating", "review_text"]'::jsonb),

('new_message_notification', 'email', 'New Message Received', 
'<h1>New Message</h1><p>Hi {{recipient_name}},</p><p>You have received a new message from {{sender_name}}.</p><p>Subject: {{message_subject}}</p><p>Message: {{message_content}}</p>',
'New Message\n\nHi {{recipient_name}},\n\nYou have received a new message from {{sender_name}}.\n\nSubject: {{message_subject}}\nMessage: {{message_content}}',
'["recipient_name", "sender_name", "message_subject", "message_content"]'::jsonb),

('content_warning', 'email', 'Content Warning - ClearMarket', 
'<h1>Content Warning</h1><p>Hi {{user_name}},</p><p>Your recent post/comment has been flagged by the community and is under review.</p><p>Content: {{content}}</p><p>Reason: {{flag_reason}}</p><p>Please review our community guidelines.</p>',
'Content Warning\n\nHi {{user_name}},\n\nYour recent post/comment has been flagged by the community and is under review.\n\nContent: {{content}}\nReason: {{flag_reason}}\n\nPlease review our community guidelines.',
'["user_name", "content", "flag_reason"]'::jsonb);

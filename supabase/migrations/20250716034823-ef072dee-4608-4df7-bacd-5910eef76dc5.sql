-- AI-Assisted Discussion Creator System
-- Replace template-based scheduler with flexible AI-driven approach

-- AI-Generated Discussion Suggestions (Optional feature)
CREATE TABLE IF NOT EXISTS discussion_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_title TEXT NOT NULL,
  suggested_topic TEXT NOT NULL,
  rationale TEXT NOT NULL,
  confidence_score DECIMAL NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'discussion',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_by_admin BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  admin_user_id UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

-- Admin-Created Discussions with Analysis
CREATE TABLE IF NOT EXISTS admin_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'discussion',
  section TEXT NOT NULL DEFAULT 'field-rep-forum',
  similarity_analysis JSONB, -- Store conflict analysis results
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'posted'
  posted_post_id UUID REFERENCES community_posts(id),
  ai_suggestions_used BOOLEAN DEFAULT false,
  engagement_prediction JSONB, -- Store predicted engagement metrics
  conflict_score DECIMAL DEFAULT 0, -- Overall conflict score 0-1
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content Similarity Cache (Performance optimization)
CREATE TABLE IF NOT EXISTS content_similarity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT NOT NULL,
  similar_posts JSONB NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  UNIQUE(content_hash)
);

-- Community Analytics for AI suggestions
CREATE TABLE IF NOT EXISTS community_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'trending_topic', 'engagement_gap', 'user_question'
  metric_data JSONB NOT NULL,
  relevance_score DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Enable RLS on new tables
ALTER TABLE discussion_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_similarity_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussion_suggestions
CREATE POLICY "Admins can manage discussion suggestions" ON discussion_suggestions
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for admin_discussions
CREATE POLICY "Admins can manage admin discussions" ON admin_discussions
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for content_similarity_cache
CREATE POLICY "Admins can view similarity cache" ON content_similarity_cache
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can manage similarity cache" ON content_similarity_cache
  FOR ALL USING (true);

-- RLS Policies for community_analytics
CREATE POLICY "Admins can view community analytics" ON community_analytics
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can manage community analytics" ON community_analytics
  FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussion_suggestions_admin ON discussion_suggestions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_suggestions_expires ON discussion_suggestions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_discussions_admin ON admin_discussions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_discussions_status ON admin_discussions(status);
CREATE INDEX IF NOT EXISTS idx_admin_discussions_scheduled ON admin_discussions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_similarity_hash ON content_similarity_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_content_similarity_expires ON content_similarity_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_community_analytics_type ON community_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_community_analytics_expires ON community_analytics(expires_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_admin_discussions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_discussions_updated_at_trigger
  BEFORE UPDATE ON admin_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_discussions_updated_at();

-- Function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_ai_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired suggestions
  DELETE FROM discussion_suggestions WHERE expires_at < now();
  
  -- Clean up expired similarity cache
  DELETE FROM content_similarity_cache WHERE expires_at < now();
  
  -- Clean up expired analytics
  DELETE FROM community_analytics WHERE expires_at < now();
END;
$$;
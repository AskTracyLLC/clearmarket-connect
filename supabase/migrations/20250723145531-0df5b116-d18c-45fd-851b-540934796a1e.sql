-- Create trust score reviews table
CREATE TABLE public.trust_score_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  job_number TEXT NOT NULL,
  platform_system TEXT NOT NULL,
  completion_date DATE NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('field_rep', 'vendor')),
  
  -- Field Rep categories
  communication_score INTEGER CHECK (communication_score IN (-2, 0, 2)),
  on_time_performance_score INTEGER CHECK (on_time_performance_score IN (-2, 0, 2)),
  quality_of_work_score INTEGER CHECK (quality_of_work_score IN (-2, 0, 2)),
  
  -- Vendor categories (reuse communication_score)
  paid_on_time_score INTEGER CHECK (paid_on_time_score IN (-2, 0, 2)),
  provided_what_needed_score INTEGER CHECK (provided_what_needed_score IN (-2, 0, 2)),
  
  -- Review metadata
  review_text TEXT,
  attachments TEXT[], -- URLs to uploaded files
  is_negative BOOLEAN GENERATED ALWAYS AS (
    CASE 
      WHEN review_type = 'field_rep' THEN 
        (communication_score < 0 OR on_time_performance_score < 0 OR quality_of_work_score < 0)
      WHEN review_type = 'vendor' THEN 
        (communication_score < 0 OR paid_on_time_score < 0 OR provided_what_needed_score < 0)
      ELSE false
    END
  ) STORED,
  
  -- Dispute system
  is_disputed BOOLEAN DEFAULT false,
  dispute_reason TEXT,
  dispute_attachments TEXT[],
  dispute_status TEXT DEFAULT 'none' CHECK (dispute_status IN ('none', 'pending', 'resolved_withdrawn', 'resolved_upheld')),
  moderator_decision TEXT,
  moderator_id UUID,
  
  -- Visibility controls
  is_hidden BOOLEAN DEFAULT false,
  hidden_until TIMESTAMP WITH TIME ZONE,
  hidden_by_credits BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_review_timing CHECK (created_at <= completion_date + INTERVAL '10 days'),
  CONSTRAINT valid_field_rep_scores CHECK (
    review_type != 'field_rep' OR (
      communication_score IS NOT NULL AND 
      on_time_performance_score IS NOT NULL AND 
      quality_of_work_score IS NOT NULL AND
      paid_on_time_score IS NULL AND
      provided_what_needed_score IS NULL
    )
  ),
  CONSTRAINT valid_vendor_scores CHECK (
    review_type != 'vendor' OR (
      communication_score IS NOT NULL AND 
      paid_on_time_score IS NOT NULL AND 
      provided_what_needed_score IS NOT NULL AND
      on_time_performance_score IS NULL AND
      quality_of_work_score IS NULL
    )
  )
);

-- Create trust scores table to cache calculated scores
CREATE TABLE public.trust_scores (
  user_id UUID PRIMARY KEY,
  user_role TEXT NOT NULL CHECK (user_role IN ('field_rep', 'vendor')),
  
  -- Category scores (0-100 scale)
  communication_score NUMERIC(5,2) DEFAULT 50,
  
  -- Field Rep specific
  on_time_performance_score NUMERIC(5,2),
  quality_of_work_score NUMERIC(5,2),
  
  -- Vendor specific  
  paid_on_time_score NUMERIC(5,2),
  provided_what_needed_score NUMERIC(5,2),
  
  -- Overall score
  overall_trust_score NUMERIC(5,2) DEFAULT 50,
  
  -- Badge level
  badge_level TEXT CHECK (badge_level IN ('building_trust', 'reliable', 'reputable', 'trusted', 'verified_pro')),
  
  -- Metadata
  total_reviews INTEGER DEFAULT 0,
  last_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create review frequency tracking table
CREATE TABLE public.review_frequency_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  last_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  week_start DATE NOT NULL, -- Monday of the week when review was submitted
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(reviewer_id, reviewed_user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.trust_score_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_frequency_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trust_score_reviews
CREATE POLICY "Users can view reviews they wrote or received" ON public.trust_score_reviews
  FOR SELECT USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewed_user_id OR
    (NOT is_hidden OR hidden_until < now())
  );

CREATE POLICY "Users can create reviews" ON public.trust_score_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update reviews they wrote (for disputes)" ON public.trust_score_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id OR auth.uid() = reviewed_user_id);

CREATE POLICY "Moderators can manage all reviews" ON public.trust_score_reviews
  FOR ALL USING (get_user_role(auth.uid()) IN ('moderator', 'admin'));

-- RLS Policies for trust_scores
CREATE POLICY "Anyone can view trust scores" ON public.trust_scores
  FOR SELECT USING (true);

CREATE POLICY "System can manage trust scores" ON public.trust_scores
  FOR ALL USING (true);

-- RLS Policies for review_frequency_tracking  
CREATE POLICY "Users can view own review frequency" ON public.review_frequency_tracking
  FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "System can manage review frequency" ON public.review_frequency_tracking
  FOR ALL USING (true);

-- Function to calculate trust score from reviews
CREATE OR REPLACE FUNCTION public.calculate_trust_score(target_user_id UUID, target_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comm_avg NUMERIC := 50;
  second_avg NUMERIC := 50;
  third_avg NUMERIC := 50;
  overall_avg NUMERIC := 50;
  badge TEXT := 'building_trust';
  review_count INTEGER := 0;
  last_review TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get review count and last review date
  SELECT COUNT(*), MAX(created_at) INTO review_count, last_review
  FROM public.trust_score_reviews 
  WHERE reviewed_user_id = target_user_id 
    AND NOT is_hidden;
  
  IF review_count > 0 THEN
    -- Calculate communication score (common to both)
    SELECT (AVG(communication_score) + 2) * 25 INTO comm_avg
    FROM public.trust_score_reviews 
    WHERE reviewed_user_id = target_user_id 
      AND NOT is_hidden
      AND communication_score IS NOT NULL;
    
    IF target_role = 'field_rep' THEN
      -- Calculate field rep specific scores
      SELECT (AVG(on_time_performance_score) + 2) * 25 INTO second_avg
      FROM public.trust_score_reviews 
      WHERE reviewed_user_id = target_user_id 
        AND NOT is_hidden
        AND on_time_performance_score IS NOT NULL;
        
      SELECT (AVG(quality_of_work_score) + 2) * 25 INTO third_avg
      FROM public.trust_score_reviews 
      WHERE reviewed_user_id = target_user_id 
        AND NOT is_hidden
        AND quality_of_work_score IS NOT NULL;
        
    ELSIF target_role = 'vendor' THEN
      -- Calculate vendor specific scores
      SELECT (AVG(paid_on_time_score) + 2) * 25 INTO second_avg
      FROM public.trust_score_reviews 
      WHERE reviewed_user_id = target_user_id 
        AND NOT is_hidden
        AND paid_on_time_score IS NOT NULL;
        
      SELECT (AVG(provided_what_needed_score) + 2) * 25 INTO third_avg
      FROM public.trust_score_reviews 
      WHERE reviewed_user_id = target_user_id 
        AND NOT is_hidden
        AND provided_what_needed_score IS NOT NULL;
    END IF;
    
    -- Calculate overall average
    overall_avg := (COALESCE(comm_avg, 50) + COALESCE(second_avg, 50) + COALESCE(third_avg, 50)) / 3;
    
    -- Determine badge level
    IF overall_avg >= 95 THEN
      badge := 'verified_pro';
    ELSIF overall_avg >= 90 THEN
      badge := 'trusted';
    ELSIF overall_avg >= 80 THEN
      badge := 'reputable';
    ELSIF overall_avg >= 70 THEN
      badge := 'reliable';
    ELSE
      badge := 'building_trust';
    END IF;
  END IF;
  
  -- Upsert trust score record
  INSERT INTO public.trust_scores (
    user_id, user_role, communication_score, 
    on_time_performance_score, quality_of_work_score,
    paid_on_time_score, provided_what_needed_score,
    overall_trust_score, badge_level, total_reviews, last_review_date
  ) VALUES (
    target_user_id, target_role, comm_avg,
    CASE WHEN target_role = 'field_rep' THEN second_avg END,
    CASE WHEN target_role = 'field_rep' THEN third_avg END,
    CASE WHEN target_role = 'vendor' THEN second_avg END,
    CASE WHEN target_role = 'vendor' THEN third_avg END,
    overall_avg, badge, review_count, last_review
  )
  ON CONFLICT (user_id) DO UPDATE SET
    communication_score = EXCLUDED.communication_score,
    on_time_performance_score = EXCLUDED.on_time_performance_score,
    quality_of_work_score = EXCLUDED.quality_of_work_score,
    paid_on_time_score = EXCLUDED.paid_on_time_score,
    provided_what_needed_score = EXCLUDED.provided_what_needed_score,
    overall_trust_score = EXCLUDED.overall_trust_score,
    badge_level = EXCLUDED.badge_level,
    total_reviews = EXCLUDED.total_reviews,
    last_review_date = EXCLUDED.last_review_date,
    updated_at = now();
END;
$$;

-- Function to check if user can submit review (frequency limit)
CREATE OR REPLACE FUNCTION public.can_submit_review(reviewer_user_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week_start DATE;
  existing_review_count INTEGER;
BEGIN
  -- Get start of current week (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Check if reviewer already reviewed this user this week
  SELECT COUNT(*) INTO existing_review_count
  FROM public.review_frequency_tracking
  WHERE reviewer_id = reviewer_user_id
    AND reviewed_user_id = target_user_id
    AND week_start = current_week_start;
    
  RETURN existing_review_count = 0;
END;
$$;

-- Trigger to update trust scores when reviews are added/updated
CREATE OR REPLACE FUNCTION public.update_trust_score_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_role TEXT;
BEGIN
  -- Get the user's role
  SELECT role INTO target_role 
  FROM public.users 
  WHERE id = COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id);
  
  -- Recalculate trust score
  PERFORM public.calculate_trust_score(
    COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id), 
    target_role
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_trust_score_after_review
  AFTER INSERT OR UPDATE OR DELETE ON public.trust_score_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_trust_score_trigger();

-- Trigger to track review frequency
CREATE OR REPLACE FUNCTION public.track_review_frequency()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert frequency tracking record
  INSERT INTO public.review_frequency_tracking (
    reviewer_id, reviewed_user_id, last_review_date, week_start
  ) VALUES (
    NEW.reviewer_id, 
    NEW.reviewed_user_id, 
    NEW.created_at,
    date_trunc('week', NEW.created_at)::DATE
  )
  ON CONFLICT (reviewer_id, reviewed_user_id, week_start) 
  DO UPDATE SET last_review_date = NEW.created_at;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_review_frequency_trigger
  AFTER INSERT ON public.trust_score_reviews
  FOR EACH ROW EXECUTE FUNCTION public.track_review_frequency();

-- Function to hide review with ClearCredits
CREATE OR REPLACE FUNCTION public.hide_review_with_credits(review_id UUID, hide_days INTEGER DEFAULT 30)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  review_record RECORD;
  credit_cost INTEGER := 1; -- 1 ClearCredit to hide a review
BEGIN
  -- Get review details
  SELECT * INTO review_record
  FROM public.trust_score_reviews
  WHERE id = review_id AND reviewed_user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if already hidden by credits
  IF review_record.hidden_by_credits THEN
    RETURN false;
  END IF;
  
  -- Check if user has enough credits
  IF NOT public.spend_clear_credits(auth.uid(), credit_cost, review_id, 'hide_review') THEN
    RETURN false;
  END IF;
  
  -- Hide the review
  UPDATE public.trust_score_reviews
  SET 
    is_hidden = true,
    hidden_until = now() + (hide_days || ' days')::INTERVAL,
    hidden_by_credits = true,
    updated_at = now()
  WHERE id = review_id;
  
  RETURN true;
END;
$$;
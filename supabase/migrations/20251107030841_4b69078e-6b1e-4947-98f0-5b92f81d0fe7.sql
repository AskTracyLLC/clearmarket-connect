-- Add view tracking to coverage requests
ALTER TABLE coverage_requests 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS response_count integer DEFAULT 0 NOT NULL;

-- Create table to track individual views for analytics
CREATE TABLE IF NOT EXISTS coverage_request_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES coverage_requests(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(request_id, viewer_id)
);

-- Enable RLS on coverage_request_views
ALTER TABLE coverage_request_views ENABLE ROW LEVEL SECURITY;

-- Policy: Field reps can create view records
CREATE POLICY "Field reps can record views"
ON coverage_request_views
FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Policy: Vendors can see who viewed their requests
CREATE POLICY "Vendors can see views on their requests"
ON coverage_request_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coverage_requests
    WHERE coverage_requests.id = coverage_request_views.request_id
    AND coverage_requests.vendor_user_id = auth.uid()
  )
);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_coverage_request_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coverage_requests
  SET view_count = view_count + 1
  WHERE id = NEW.request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS trigger_increment_coverage_request_views ON coverage_request_views;
CREATE TRIGGER trigger_increment_coverage_request_views
AFTER INSERT ON coverage_request_views
FOR EACH ROW
EXECUTE FUNCTION increment_coverage_request_views();

-- Function to update response count
CREATE OR REPLACE FUNCTION update_coverage_request_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE coverage_requests
    SET response_count = response_count + 1
    WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE coverage_requests
    SET response_count = GREATEST(response_count - 1, 0)
    WHERE id = OLD.request_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update response count
DROP TRIGGER IF EXISTS trigger_update_coverage_request_response_count ON coverage_request_responses;
CREATE TRIGGER trigger_update_coverage_request_response_count
AFTER INSERT OR DELETE ON coverage_request_responses
FOR EACH ROW
EXECUTE FUNCTION update_coverage_request_response_count();

-- Backfill response counts for existing requests
UPDATE coverage_requests cr
SET response_count = (
  SELECT COUNT(*)
  FROM coverage_request_responses crr
  WHERE crr.request_id = cr.id
);
-- Function to automatically expire old connection requests
CREATE OR REPLACE FUNCTION expire_old_connection_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update expired pending requests to 'expired' status
  UPDATE public.connection_requests
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'pending'
    AND expires_at < now();
END;
$$;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- Note: This requires pg_cron to be enabled in your Supabase project
-- You can manually run: SELECT expire_old_connection_requests(); to test

COMMENT ON FUNCTION expire_old_connection_requests() IS 'Automatically marks expired connection requests as expired';
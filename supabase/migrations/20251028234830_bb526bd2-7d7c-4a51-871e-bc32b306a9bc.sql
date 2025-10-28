-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the auto-removal function to run daily at 3 AM UTC
SELECT cron.schedule(
  'auto-remove-old-feedback-posts',
  '0 3 * * *', -- Run at 3 AM UTC daily
  $$
  SELECT net.http_post(
    url:='https://bgqlhaqwsnfhhatxhtfx.supabase.co/functions/v1/auto-remove-feedback',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWxoYXF3c25maGhhdHhodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk1MDksImV4cCI6MjA2NzUxNTUwOX0.El8dESk86p4-yb8gIIoheKHRMl2YTegQb9BIfaKIhAU"}'::jsonb
  ) as request_id;
  $$
);
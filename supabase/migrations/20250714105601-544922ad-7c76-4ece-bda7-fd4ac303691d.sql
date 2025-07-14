-- Remove Telegram notification triggers that are causing server errors
-- The net schema is not available, causing these triggers to fail

DROP TRIGGER IF EXISTS on_field_rep_signup_alert ON public.field_rep_signups;
DROP TRIGGER IF EXISTS on_vendor_signup_alert ON public.vendor_signups;

-- Drop the functions as well since they won't work without net extension
DROP FUNCTION IF EXISTS public.telegram_field_rep_alert();
DROP FUNCTION IF EXISTS public.telegram_vendor_alert();
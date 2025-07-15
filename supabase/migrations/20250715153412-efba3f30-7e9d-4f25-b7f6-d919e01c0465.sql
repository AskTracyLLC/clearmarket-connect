-- Create triggers for automatic email sending on signup
-- These triggers will call the edge functions when new signups are inserted

-- Trigger for field rep signups
CREATE TRIGGER after_field_rep_signup_insert
  AFTER INSERT ON public.field_rep_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.send_field_rep_signup_email();

-- Trigger for vendor signups  
CREATE TRIGGER after_vendor_signup_insert
  AFTER INSERT ON public.vendor_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.send_vendor_signup_email();
-- Hotfix: Remove slow email trigger on pre_launch_signups to prevent Join submission from hanging
-- Rollback instructions included

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.pre_launch_signups'::regclass
      AND tgname = 'send_beta_token_email_trigger'
  ) THEN
    DROP TRIGGER send_beta_token_email_trigger ON public.pre_launch_signups;
  END IF;
END $$;
-- Rollback: CREATE TRIGGER send_beta_token_email_trigger AFTER INSERT ON public.pre_launch_signups FOR EACH ROW EXECUTE FUNCTION public.handle_beta_signup_email_with_token();
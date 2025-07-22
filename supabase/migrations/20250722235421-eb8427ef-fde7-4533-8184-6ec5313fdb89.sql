-- Create beta registration tokens table for secure completion links
CREATE TABLE public.beta_registration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('field-rep', 'vendor')),
  anonymous_username TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_registration_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for beta registration tokens
CREATE POLICY "Anyone can view valid unused tokens" ON public.beta_registration_tokens
FOR SELECT USING (expires_at > now() AND used_at IS NULL);

CREATE POLICY "System can manage tokens" ON public.beta_registration_tokens
FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_beta_registration_tokens_token ON public.beta_registration_tokens(token);
CREATE INDEX idx_beta_registration_tokens_email ON public.beta_registration_tokens(email);
CREATE INDEX idx_beta_registration_tokens_expires ON public.beta_registration_tokens(expires_at);

-- Add trigger for updated_at
CREATE TRIGGER update_beta_registration_tokens_updated_at
BEFORE UPDATE ON public.beta_registration_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate secure registration token
CREATE OR REPLACE FUNCTION public.generate_beta_registration_token(
  user_email TEXT,
  user_type_param TEXT,
  username TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  -- Generate a secure random token
  LOOP
    new_token := encode(gen_random_bytes(32), 'base64url');
    
    -- Check if token already exists
    SELECT EXISTS (
      SELECT 1 FROM public.beta_registration_tokens 
      WHERE token = new_token
    ) INTO token_exists;
    
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  -- Insert the new token
  INSERT INTO public.beta_registration_tokens (
    email, token, user_type, anonymous_username
  ) VALUES (
    user_email, new_token, user_type_param, username
  );
  
  RETURN new_token;
END;
$$;

-- Function to complete beta registration
CREATE OR REPLACE FUNCTION public.complete_beta_registration(
  registration_token TEXT,
  user_password TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
  new_user_id UUID;
  auth_user_record RECORD;
  result JSONB;
BEGIN
  -- Get and validate token
  SELECT * INTO token_record
  FROM public.beta_registration_tokens
  WHERE token = registration_token
    AND expires_at > now()
    AND used_at IS NULL;
    
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired token');
  END IF;
  
  -- Check if user already exists in auth
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = token_record.email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already exists');
  END IF;
  
  -- Create user in auth.users (this would typically be done via Supabase Auth API)
  -- For now, we'll create a placeholder and let the frontend handle auth creation
  
  -- Mark token as used
  UPDATE public.beta_registration_tokens
  SET used_at = now(), updated_at = now()
  WHERE token = registration_token;
  
  RETURN jsonb_build_object(
    'success', true, 
    'email', token_record.email,
    'user_type', token_record.user_type,
    'anonymous_username', token_record.anonymous_username
  );
END;
$$;

-- Update email templates table with beta registration templates
INSERT INTO public.email_templates (name, subject, html_content) VALUES
('field-rep-signup-beta', 'Welcome to ClearMarket Beta - Complete Your Registration', 
'<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to ClearMarket Beta!</h1>
            <p>Your username: {{anonymous_username}}</p>
        </div>
        <div class="content">
            <h2>Complete Your Beta Registration</h2>
            <p>Thank you for joining the ClearMarket beta program! You''re about to become part of an exclusive community of field representatives testing the future of property inspection networking.</p>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Click the button below to complete your registration</li>
                <li>Create your secure password</li>
                <li>Sign the Beta-NDA (required for access)</li>
                <li>Complete your profile</li>
                <li>Start connecting with the community!</li>
            </ol>
            
            <div style="text-align: center;">
                <a href="{{registration_link}}" class="button">Complete Beta Registration</a>
            </div>
            
            <p><strong>What''s Next?</strong></p>
            <ul>
                <li>🏗️ Test new features before anyone else</li>
                <li>💬 Connect with other beta testers</li>
                <li>📝 Share feedback to shape the platform</li>
                <li>🎁 Earn exclusive beta tester badges</li>
            </ul>
            
            <p>This registration link expires in 7 days. If you have any questions, just reply to this email.</p>
        </div>
        <div class="footer">
            <p>ClearMarket Beta Program | Building the future of field rep networking</p>
        </div>
    </div>
</body>
</html>'),

('vendor-signup-beta', 'Welcome to ClearMarket Beta - Complete Your Registration', 
'<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to ClearMarket Beta!</h1>
            <p>Your username: {{anonymous_username}}</p>
        </div>
        <div class="content">
            <h2>Complete Your Beta Registration</h2>
            <p>Thank you for joining the ClearMarket beta program as a vendor! You''re about to gain early access to our revolutionary field rep networking platform.</p>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Click the button below to complete your registration</li>
                <li>Create your secure password</li>
                <li>Sign the Beta-NDA (required for access)</li>
                <li>Complete your company profile</li>
                <li>Start building your network!</li>
            </ol>
            
            <div style="text-align: center;">
                <a href="{{registration_link}}" class="button">Complete Beta Registration</a>
            </div>
            
            <p><strong>Beta Vendor Benefits:</strong></p>
            <ul>
                <li>🔍 Early access to field rep search tools</li>
                <li>📊 Advanced coverage mapping features</li>
                <li>💼 Priority support and feedback channels</li>
                <li>🏆 Exclusive beta vendor recognition</li>
            </ul>
            
            <p>This registration link expires in 7 days. Questions? Just reply to this email.</p>
        </div>
        <div class="footer">
            <p>ClearMarket Beta Program | Connecting vendors with quality field reps</p>
        </div>
    </div>
</body>
</html>');

-- Update existing beta signup triggers to generate registration tokens
CREATE OR REPLACE FUNCTION public.handle_beta_signup_email_with_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  payload JSONB;
  http_response RECORD;
  registration_token TEXT;
  registration_link TEXT;
BEGIN
  -- Generate registration token
  registration_token := public.generate_beta_registration_token(
    NEW.email, 
    NEW.user_type, 
    NEW.anonymous_username
  );
  
  -- Create registration link
  registration_link := 'https://bgqlhaqwsnfhhatxhtfx.supabase.co/beta-register?token=' || registration_token;
  
  -- Hardcode the function URL with correct project ID
  function_url := 'https://bgqlhaqwsnfhhatxhtfx.supabase.co/functions/v1/send-signup-email';
  
  -- Prepare the payload with registration link
  payload := jsonb_build_object(
    'signupType', NEW.user_type,
    'email', NEW.email,
    'anonymous_username', COALESCE(NEW.anonymous_username, 'User#0'),
    'beta_tester', true,
    'registration_link', registration_link
  );

  -- Call the Edge Function using http extension
  SELECT INTO http_response * FROM http((
    'POST',
    function_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWxoYXF3c25maGhhdHhodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk1MDksImV4cCI6MjA2NzUxNTUwOX0.El8dESk86p4-yb8gIIoheKHRMl2YTegQb9BIfaKIhAU')
    ],
    'application/json',
    payload::text
  ));

  -- Log the response (optional)
  RAISE NOTICE 'Beta signup email with token response: status=%, content=%', 
    http_response.status, http_response.content;

  -- If email sending failed, log it but don't prevent the signup
  IF http_response.status NOT BETWEEN 200 AND 299 THEN
    RAISE WARNING 'Failed to send beta signup email for %: HTTP %', 
      NEW.email, http_response.status;
  END IF;

  RETURN NEW;
END;
$$;
-- Insert email templates for signup emails
INSERT INTO public.email_templates (name, subject, html_content) VALUES 
(
  'field-rep-signup-standard',
  'Welcome to ClearMarket, {{anonymous_username}}!',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to ClearMarket</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to ClearMarket!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You''re {{anonymous_username}} in our community</p>
        </div>
        
        <!-- Body -->
        <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Thank you for joining as a Field Rep!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We''re excited to have you as part of the ClearMarket community. As a field inspection professional, you''ll be among the first to experience our revolutionary platform when we launch.
            </p>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What''s Next?</h3>
                <ul style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>We''ll notify you immediately when ClearMarket launches</li>
                    <li>You''ll receive priority access to all new features</li>
                    <li>Regular updates on our development progress</li>
                    <li>Opportunities to connect with vendors seeking reliable field reps</li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
                    🚀 Get ready to find more work and build your reputation!
                </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Questions? Just reply to this email - we''d love to hear from you!<br>
                <strong>The ClearMarket Team</strong>
            </p>
        </div>
    </div>
</body>
</html>'
),
(
  'field-rep-signup-beta',
  'Welcome to ClearMarket Beta Program, {{anonymous_username}}!',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to ClearMarket Beta</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🚀 Welcome to ClearMarket Beta!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You''re {{anonymous_username}} - Beta Tester</p>
        </div>
        
        <!-- Body -->
        <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Thank you for joining our Beta Program as a Field Rep!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Congratulations! You''ve been selected for exclusive early access to ClearMarket. As a beta tester, you''ll help shape the future of field inspection work.
            </p>

            <div style="background: #10b981; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px;">🎯 Your Beta Benefits:</h3>
                <ul style="color: white; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li><strong>First Access:</strong> Test ClearMarket before anyone else</li>
                    <li><strong>Direct Input:</strong> Your feedback directly influences our development</li>
                    <li><strong>Free Credits:</strong> Complimentary platform credits during beta</li>
                    <li><strong>Priority Support:</strong> Direct line to our development team</li>
                    <li><strong>Lifetime Benefits:</strong> Special recognition as a founding beta user</li>
                </ul>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What Happens Next?</h3>
                <ul style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>You''ll receive beta access within the next 2 weeks</li>
                    <li>Exclusive beta tester communication channel access</li>
                    <li>Weekly product updates and feedback sessions</li>
                    <li>First priority when we launch publicly</li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
                    🌟 Thank you for believing in ClearMarket''s vision!
                </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Questions about the beta program? Reply to this email!<br>
                <strong>The ClearMarket Beta Team</strong>
            </p>
        </div>
    </div>
</body>
</html>'
),
(
  'vendor-signup-standard',
  'Welcome to ClearMarket, {{anonymous_username}}!',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to ClearMarket</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to ClearMarket!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You''re {{anonymous_username}} in our community</p>
        </div>
        
        <!-- Body -->
        <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Thank you for joining as a Vendor!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We''re excited to have you as part of the ClearMarket community. As an inspection vendor, you''ll be among the first to experience our revolutionary platform when we launch.
            </p>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What''s Next?</h3>
                <ul style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>We''ll notify you immediately when ClearMarket launches</li>
                    <li>You''ll receive priority access to all new features</li>
                    <li>Regular updates on our development progress</li>
                    <li>Early access to our network of verified field representatives</li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
                    🚀 Get ready to find reliable coverage with trusted professionals!
                </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Questions? Just reply to this email - we''d love to hear from you!<br>
                <strong>The ClearMarket Team</strong>
            </p>
        </div>
    </div>
</body>
</html>'
),
(
  'vendor-signup-beta',
  'Welcome to ClearMarket Beta Program, {{anonymous_username}}!',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to ClearMarket Beta</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🚀 Welcome to ClearMarket Beta!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You''re {{anonymous_username}} - Beta Tester</p>
        </div>
        
        <!-- Body -->
        <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Thank you for joining our Beta Program as a Vendor!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Congratulations! You''ve been selected for exclusive early access to ClearMarket. As a beta tester, you''ll help shape the future of vendor-field rep relationships.
            </p>

            <div style="background: #10b981; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px;">🎯 Your Beta Benefits:</h3>
                <ul style="color: white; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li><strong>First Access:</strong> Test ClearMarket before anyone else</li>
                    <li><strong>Direct Input:</strong> Your feedback directly influences our development</li>
                    <li><strong>Free Credits:</strong> Complimentary platform credits during beta</li>
                    <li><strong>Priority Support:</strong> Direct line to our development team</li>
                    <li><strong>Lifetime Benefits:</strong> Special recognition as a founding beta user</li>
                </ul>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What Happens Next?</h3>
                <ul style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>You''ll receive beta access within the next 2 weeks</li>
                    <li>Exclusive beta tester communication channel access</li>
                    <li>Weekly product updates and feedback sessions</li>
                    <li>First priority when we launch publicly</li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
                    🌟 Thank you for believing in ClearMarket''s vision!
                </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Questions about the beta program? Reply to this email!<br>
                <strong>The ClearMarket Beta Team</strong>
            </p>
        </div>
    </div>
</body>
</html>'
);
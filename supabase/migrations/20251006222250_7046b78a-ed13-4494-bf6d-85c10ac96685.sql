-- Update field-rep-signup-beta email template
UPDATE email_templates 
SET 
  subject = 'Welcome to ClearMarket Beta, {{anonymous_username}}!',
  html_content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px;
            font-weight: bold;
        }
        .header p { 
            margin: 0; 
            font-size: 16px;
            opacity: 0.95;
        }
        .credentials-banner {
            background: #10b981;
            color: white;
            padding: 20px 30px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
        .credentials-banner p {
            margin: 5px 0 0 0;
            font-size: 14px;
            font-weight: normal;
            opacity: 0.9;
        }
        .content { 
            background: #ffffff; 
            padding: 30px; 
        }
        .credentials-box {
            background: #1e293b;
            border: 2px solid #334155;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-family: "Courier New", monospace;
        }
        .credentials-box p {
            margin: 8px 0;
            color: #94a3b8;
            font-size: 14px;
        }
        .credentials-box strong {
            color: #22d3ee;
            font-size: 16px;
        }
        .login-button { 
            display: inline-block; 
            background: #10b981;
            color: white !important; 
            padding: 14px 32px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            margin: 20px 0;
            font-size: 16px;
        }
        .benefits {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
        }
        .benefits h3 {
            margin-top: 0;
            color: #1e293b;
        }
        .benefits ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .benefits li {
            margin: 8px 0;
            color: #475569;
        }
        .warning-box {
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 25px 0;
        }
        .warning-box strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
        }
        .warning-box p {
            margin: 0;
            color: #78350f;
            font-size: 14px;
        }
        .cta-banner {
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 8px;
            margin: 25px 0;
        }
        .cta-banner p {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px; 
            color: #64748b; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to ClearMarket Beta!</h1>
            <p>You''re {{anonymous_username}} - our exclusive beta tester</p>
        </div>
        
        <div class="credentials-banner">
            🔑 Your Beta Access Credentials
            <p>Ready to log in and start testing!</p>
        </div>
        
        <div class="content">
            <h2 style="margin-top: 0; color: #1e293b;">Your Login Information:</h2>
            
            <div class="credentials-box">
                <p><strong>Username:</strong> {{anonymous_username}}</p>
                <p><strong>Password:</strong> {{temp_password}}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="https://useclearmarket.io/auth" class="login-button">🚀 Login & Start Testing</a>
            </div>
            
            <div class="benefits">
                <h3>As a Beta Tester, You''ll Get:</h3>
                <ul>
                    <li><strong>Immediate access</strong> to all ClearMarket features before anyone else</li>
                    <li><strong>Direct input</strong> on feature development and improvements</li>
                    <li><strong>Priority support</strong> from our development team</li>
                    <li><strong>Exclusive beta tester community</strong> access</li>
                    <li><strong>Early access credits</strong> to test premium features</li>
                    <li><strong>Special recognition</strong> as a founding beta tester</li>
                </ul>
            </div>
            
            <div class="warning-box">
                <strong>🔒 Keep Your Credentials Safe</strong>
                <p>Save these credentials securely. You''ll need them to access your beta account and start creating your professional profile.</p>
            </div>
            
            <div class="cta-banner">
                <p>🎯 Ready to shape the future of field inspections? Log in now and start testing!</p>
            </div>
            
            <p style="margin-top: 25px; color: #64748b; font-size: 14px;">
                Questions about beta testing? Reply to this email - our team is here to help!<br>
                <strong style="color: #3b82f6;">The ClearMarket Beta Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>ClearMarket Beta Program | Building the future of field inspection networking</p>
            <p style="margin-top: 8px;">© 2025 ClearMarket. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
  updated_at = NOW()
WHERE name = 'field-rep-signup-beta';

-- Update vendor-signup-beta email template
UPDATE email_templates 
SET 
  subject = 'Welcome to ClearMarket Beta, {{anonymous_username}}!',
  html_content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px;
            font-weight: bold;
        }
        .header p { 
            margin: 0; 
            font-size: 16px;
            opacity: 0.95;
        }
        .credentials-banner {
            background: #10b981;
            color: white;
            padding: 20px 30px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
        .credentials-banner p {
            margin: 5px 0 0 0;
            font-size: 14px;
            font-weight: normal;
            opacity: 0.9;
        }
        .content { 
            background: #ffffff; 
            padding: 30px; 
        }
        .credentials-box {
            background: #1e293b;
            border: 2px solid #334155;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-family: "Courier New", monospace;
        }
        .credentials-box p {
            margin: 8px 0;
            color: #94a3b8;
            font-size: 14px;
        }
        .credentials-box strong {
            color: #22d3ee;
            font-size: 16px;
        }
        .login-button { 
            display: inline-block; 
            background: #10b981;
            color: white !important; 
            padding: 14px 32px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            margin: 20px 0;
            font-size: 16px;
        }
        .benefits {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
        }
        .benefits h3 {
            margin-top: 0;
            color: #1e293b;
        }
        .benefits ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .benefits li {
            margin: 8px 0;
            color: #475569;
        }
        .warning-box {
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 25px 0;
        }
        .warning-box strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
        }
        .warning-box p {
            margin: 0;
            color: #78350f;
            font-size: 14px;
        }
        .cta-banner {
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 8px;
            margin: 25px 0;
        }
        .cta-banner p {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px; 
            color: #64748b; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to ClearMarket Beta!</h1>
            <p>You''re {{anonymous_username}} - our exclusive beta tester</p>
        </div>
        
        <div class="credentials-banner">
            🔑 Your Beta Access Credentials
            <p>Ready to log in and start testing!</p>
        </div>
        
        <div class="content">
            <h2 style="margin-top: 0; color: #1e293b;">Your Login Information:</h2>
            
            <div class="credentials-box">
                <p><strong>Username:</strong> {{anonymous_username}}</p>
                <p><strong>Password:</strong> {{temp_password}}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="https://useclearmarket.io/auth" class="login-button">🚀 Login & Start Testing</a>
            </div>
            
            <div class="benefits">
                <h3>As a Beta Tester, You''ll Get:</h3>
                <ul>
                    <li><strong>Immediate access</strong> to all ClearMarket features before anyone else</li>
                    <li><strong>Direct input</strong> on feature development and improvements</li>
                    <li><strong>Priority support</strong> from our development team</li>
                    <li><strong>Exclusive beta tester community</strong> access</li>
                    <li><strong>Early access credits</strong> to test premium features</li>
                    <li><strong>Special recognition</strong> as a founding beta tester</li>
                </ul>
            </div>
            
            <div class="warning-box">
                <strong>🔒 Keep Your Credentials Safe</strong>
                <p>Save these credentials securely. You''ll need them to access your beta account and start building your vendor network.</p>
            </div>
            
            <div class="cta-banner">
                <p>🎯 Ready to expand your coverage network? Log in now and start testing!</p>
            </div>
            
            <p style="margin-top: 25px; color: #64748b; font-size: 14px;">
                Questions about beta testing? Reply to this email - our team is here to help!<br>
                <strong style="color: #3b82f6;">The ClearMarket Beta Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>ClearMarket Beta Program | Building the future of vendor-field rep connections</p>
            <p style="margin-top: 8px;">© 2025 ClearMarket. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
  updated_at = NOW()
WHERE name = 'vendor-signup-beta';
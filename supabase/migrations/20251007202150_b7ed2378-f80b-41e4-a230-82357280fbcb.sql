-- Check if password-reset template exists, if not insert it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'password-reset') THEN
    INSERT INTO email_templates (name, subject, html_content)
    VALUES (
      'password-reset',
      'Reset Your ClearMarket Password',
      '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClearMarket</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Hello <strong>{{anonymous_username}}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your ClearMarket account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 0 30px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="{{reset_link}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f1f5f9; border-radius: 6px; color: #3b82f6; font-size: 13px; word-break: break-all;">
                {{reset_link}}
              </p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn''t request a password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Need help? Contact us at <a href="mailto:support@useclearmarket.io" style="color: #3b82f6; text-decoration: none;">support@useclearmarket.io</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #94a3b8; font-size: 13px;">
                © 2025 ClearMarket. All rights reserved.
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                Connecting property preservation professionals nationwide
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
    );
  ELSE
    UPDATE email_templates
    SET 
      subject = 'Reset Your ClearMarket Password',
      html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClearMarket</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Hello <strong>{{anonymous_username}}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your ClearMarket account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 0 30px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="{{reset_link}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f1f5f9; border-radius: 6px; color: #3b82f6; font-size: 13px; word-break: break-all;">
                {{reset_link}}
              </p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn''t request a password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Need help? Contact us at <a href="mailto:support@useclearmarket.io" style="color: #3b82f6; text-decoration: none;">support@useclearmarket.io</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #94a3b8; font-size: 13px;">
                © 2025 ClearMarket. All rights reserved.
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                Connecting property preservation professionals nationwide
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
      updated_at = now()
    WHERE name = 'password-reset';
  END IF;
END $$;
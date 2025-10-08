-- Delete existing password reset template if it exists
DELETE FROM public.email_templates WHERE name = 'password-reset';

-- Insert new password reset email template
INSERT INTO public.email_templates (name, subject, html_content)
VALUES (
  'password-reset',
  'Reset Your ClearMarket Password',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">ClearMarket</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                Hi <strong>{{anonymous_username}}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your ClearMarket account. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="{{reset_link}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px; padding: 12px; background-color: #f1f5f9; border-radius: 4px; color: #475569; font-size: 13px; word-break: break-all; font-family: monospace;">
                {{reset_link}}
              </p>
              
              <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 0 0 24px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour. If you didn''t request this reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>
              
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; line-height: 1.6;">
                Need help? Contact our support team at <a href="mailto:{{support_email}}" style="color: #3b82f6; text-decoration: none;">{{support_email}}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-align: center; line-height: 1.5;">
                © 2025 {{company_name}}. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                Connecting Field Reps and Vendors with trust and transparency.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Extra Footer -->
        <table width="600" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                <a href="{{help_center_url}}" style="color: #64748b; text-decoration: none; margin: 0 8px;">Help Center</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="https://useclearmarket.io/privacy" style="color: #64748b; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="https://useclearmarket.io/terms" style="color: #64748b; text-decoration: none; margin: 0 8px;">Terms of Service</a>
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
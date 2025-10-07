-- Update branded password reset email template for ClearMarket
-- Rollback: set the previous subject/html_content captured before this change.
DO $migration$
BEGIN
  IF EXISTS (SELECT 1 FROM email_templates WHERE name = 'password-reset') THEN
    UPDATE email_templates
    SET
      subject = '[ClearMarket] Reset your password',
      html_content = '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[ClearMarket] Reset your password</title>
    <style>
      body { margin:0; padding:0; background:#f5f7fb; font-family: -apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif; color:#111827; }
      a { color:#2563eb; text-decoration:none; }
      .container { width:100%; background:#f5f7fb; padding:24px 0; }
      .card { max-width: 600px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(59,130,246,0.15); overflow:hidden; }
      .header { background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 20px 24px; color:#ffffff; }
      .brand { font-size:20px; font-weight:700; letter-spacing:0.2px; }
      .content { padding: 24px; }
      .h1 { font-size:20px; margin:0 0 12px 0; }
      .p { font-size:14px; line-height:1.6; margin:0 0 12px 0; color:#374151; }
      .cta { display:inline-block; background:#3b82f6; color:#ffffff; padding:12px 18px; border-radius:8px; font-weight:600; margin: 12px 0; }
      .muted { color:#6b7280; font-size:12px; }
      .divider { height:1px; background:#e5e7eb; margin:16px 0; }
      .footer { padding: 16px 24px; color:#6b7280; font-size:12px; text-align:center; }
      .preheader { display:none; font-size:1px; color:#f5f7fb; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }
    </style>
  </head>
  <body>
    <span class="preheader">Password reset requested for your ClearMarket account.</span>
    <div class="container">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <div class="card">
              <div class="header">
                <div class="brand">ClearMarket</div>
              </div>
              <div class="content">
                <h1 class="h1">Reset your ClearMarket password</h1>
                <p class="p">Hello {{anonymous_username}},</p>
                <p class="p">We received a request to reset the password for your ClearMarket account. Click the button below to choose a new password. This link will expire for your security.</p>
                <p>
                  <a class="cta" href="{{reset_link}}" target="_blank" rel="noopener">Reset Password</a>
                </p>
                <p class="p">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
                <div class="divider"></div>
                <p class="muted">Need help? Contact us at <a href="mailto:support@useclearmarket.io">support@useclearmarket.io</a> or visit our help center: <a href="{{help_center_url}}" target="_blank">useclearmarket.io/help</a>.</p>
                <p class="muted">For your security, never share your reset link with anyone.</p>
              </div>
              <div class="footer">
                <p>&copy; <span id="year">2025</span> ClearMarket. All rights reserved.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <script>document.getElementById(''year'').textContent = String(new Date().getFullYear());</script>
  </body>
</html>',
      updated_at = now()
    WHERE name = 'password-reset';
  ELSE
    INSERT INTO email_templates (name, subject, html_content)
    VALUES (
      'password-reset',
      '[ClearMarket] Reset your password',
      '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[ClearMarket] Reset your password</title>
  </head>
  <body>
    <p>Hello {{anonymous_username}},</p>
    <p>Use the link below to reset your ClearMarket password:</p>
    <p><a href="{{reset_link}}">Reset Password</a></p>
    <p>If you didn''t request this, you can ignore this email.</p>
  </body>
</html>'
    );
  END IF;
END $migration$;
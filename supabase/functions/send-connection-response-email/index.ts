import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConnectionResponseEmailRequest {
  recipientEmail: string;
  recipientUsername: string;
  responderUsername: string;
  responderRole: string;
  status: 'accepted' | 'rejected';
}

const supabaseService = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientUsername, responderUsername, responderRole, status }: ConnectionResponseEmailRequest = await req.json();

    console.log(`Sending connection response email to: ${recipientEmail}`);

    const roleLabel = responderRole === 'field_rep' ? 'Field Rep' : 'Vendor';
    const statusLabel = status === 'accepted' ? 'Accepted' : 'Declined';
    const statusColor = status === 'accepted' ? '#10b981' : '#ef4444';
    const subject = `Connection Request ${statusLabel} by ${responderUsername}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
            .status-box { background: ${status === 'accepted' ? '#d1fae5' : '#fee2e2'}; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Connection Request ${statusLabel}</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientUsername},</p>
              <div class="status-box">
                <p style="margin: 0; font-weight: 600; color: ${statusColor};">
                  <strong>${responderUsername}</strong> (${roleLabel}) has ${status === 'accepted' ? 'accepted' : 'declined'} your connection request.
                </p>
              </div>
              ${status === 'accepted' ? `
                <p>Great news! You can now:</p>
                <ul>
                  <li>View their full contact information</li>
                  <li>Send direct messages</li>
                  <li>Collaborate on projects</li>
                </ul>
                <div style="text-align: center;">
                  <a href="https://useclearmarket.io/vendor-dashboard" class="button">View Network</a>
                </div>
              ` : `
                <p>While this connection didn't work out, there are many other professionals on ClearMarket ready to connect.</p>
                <div style="text-align: center;">
                  <a href="https://useclearmarket.io/field-rep-search" class="button">Find More Field Reps</a>
                </div>
              `}
              <div class="footer">
                <p>This is an automated message from ClearMarket</p>
                <p><a href="https://useclearmarket.io" style="color: #3b82f6;">useclearmarket.io</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ClearMarket <noreply@useclearmarket.io>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully:", emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Connection response email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Email sending error:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

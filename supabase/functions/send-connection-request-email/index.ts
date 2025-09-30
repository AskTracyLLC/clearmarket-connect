import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConnectionRequestEmailRequest {
  recipientEmail: string;
  recipientUsername: string;
  senderUsername: string;
  senderRole: string;
  personalMessage?: string;
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
    const { recipientEmail, recipientUsername, senderUsername, senderRole, personalMessage }: ConnectionRequestEmailRequest = await req.json();

    console.log(`Sending connection request email to: ${recipientEmail}`);

    const roleLabel = senderRole === 'vendor' ? 'Vendor' : 'Field Rep';
    const subject = `New Connection Request from ${senderUsername}`;

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
            .message-box { background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Connection Request</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientUsername},</p>
              <p><strong>${senderUsername}</strong> (${roleLabel}) wants to connect with you on ClearMarket.</p>
              ${personalMessage ? `
                <div class="message-box">
                  <strong>Personal Message:</strong>
                  <p style="margin: 10px 0 0 0;">${personalMessage}</p>
                </div>
              ` : ''}
              <p>Log in to your dashboard to accept or decline this connection request.</p>
              <div style="text-align: center;">
                <a href="https://useclearmarket.io/field-rep-dashboard" class="button">View Request</a>
              </div>
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
      message: "Connection request email sent successfully"
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

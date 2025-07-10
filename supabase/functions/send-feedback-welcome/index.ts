import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackWelcomeRequest {
  email: string;
  anonymousUsername: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, anonymousUsername }: FeedbackWelcomeRequest = await req.json();

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate access token (24 hour expiry)
    const accessToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store feedback session
    const { error: sessionError } = await supabase
      .from('feedback_sessions')
      .insert({
        user_email: email,
        anonymous_username: anonymousUsername,
        access_token: accessToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error("Error creating feedback session:", sessionError);
      throw sessionError;
    }

    // Create feedback page access link
    const feedbackLink = `https://clearmarket.lovable.app/feedback?token=${accessToken}`;

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "ClearMarket <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the ClearMarket Feedback Group!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Welcome to the ClearMarket Feedback Group!</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #334155; font-size: 18px; margin: 0 0 10px 0;">Your Anonymous Identity</h2>
            <p style="color: #64748b; margin: 0; font-size: 16px;">
              Your anonymous username: <strong style="color: #0f172a;">${anonymousUsername}</strong>
            </p>
            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">
              This username will be used for all your feedback posts and comments to maintain your privacy.
            </p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #334155; font-size: 18px; margin: 0 0 15px 0;">Access Your Feedback Page</h2>
            <p style="color: #64748b; margin: 0 0 15px 0; font-size: 16px;">
              Click the secure link below to access the private ClearMarket Feedback Group:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${feedbackLink}" 
                 style="background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                Access Feedback Group
              </a>
            </div>
            <p style="color: #ef4444; margin: 0; font-size: 14px; font-weight: 500;">
              ⚠️ This link expires in 24 hours for security.
            </p>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 8px 0;">What you can do:</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>View and upvote feature requests</li>
              <li>Comment on existing suggestions</li>
              <li>Share your ideas anonymously</li>
              <li>Help shape ClearMarket's development</li>
            </ul>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Thank you for joining our feedback community!<br>
              <strong>The ClearMarket Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Feedback welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback-welcome function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
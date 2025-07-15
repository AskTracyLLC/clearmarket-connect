import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupEmailRequest {
  signupType: 'field_rep' | 'vendor';
  email: string;
  anonymous_username: string;
  beta_tester?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signupType, email, anonymous_username, beta_tester = false }: SignupEmailRequest = await req.json();

    console.log('Sending signup email:', { signupType, email, anonymous_username, beta_tester });

    // Determine email content based on signup type
    const userTypeLabel = signupType === 'field_rep' ? 'Field Rep' : 'Vendor';
    const roleDescription = signupType === 'field_rep' 
      ? 'field inspection professional' 
      : 'inspection vendor';

    const emailResponse = await resend.emails.send({
      from: "ClearMarket <hello@useclearmarket.io>",
      to: [email],
      subject: `Welcome to ClearMarket, ${anonymous_username}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to ClearMarket!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You're ${anonymous_username} in our community</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Thank you for joining as a ${userTypeLabel}!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We're excited to have you as part of the ClearMarket community. As a ${roleDescription}, you'll be among the first to experience our revolutionary platform when we launch.
            </p>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
              <ul style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>We'll notify you immediately when ClearMarket launches</li>
                <li>You'll receive priority access to all new features</li>
                ${beta_tester ? '<li><strong>Beta Access:</strong> You\'ll be invited to our exclusive beta testing program</li>' : ''}
                <li>Regular updates on our development progress</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
                🚀 Get ready to transform how you work in the field inspection industry!
              </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
              Questions? Just reply to this email - we'd love to hear from you!<br>
              <strong>The ClearMarket Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Signup email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-signup-email function:", error);
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
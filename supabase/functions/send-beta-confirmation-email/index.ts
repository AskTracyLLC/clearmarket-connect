import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BetaConfirmationEmailRequest {
  signupType: 'field_rep' | 'vendor';
  email: string;
  anonymous_username: string;
  credentials: { email: string; password: string; };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signupType, email, anonymous_username, credentials }: BetaConfirmationEmailRequest = await req.json();

    console.log('Sending beta confirmation email:', { signupType, email, anonymous_username });

    // Determine email content based on signup type
    const userTypeLabel = signupType === 'field_rep' ? 'Field Rep' : 'Vendor';
    const roleDescription = signupType === 'field_rep' 
      ? 'field inspection professional' 
      : 'inspection vendor';

    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'https://34544cc9-f36f-4fa8-8a05-17348470ccfc.lovableproject.com'}/auth`;

    const emailResponse = await resend.emails.send({
      from: "ClearMarket <hello@useclearmarket.io>",
      to: [email],
      subject: `🚀 Welcome to ClearMarket Beta, ${anonymous_username}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to ClearMarket Beta!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You're ${anonymous_username} - our exclusive beta tester</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 0 0 30px 0; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px;">🔑 Your Beta Access Credentials</h2>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Ready to log in and start testing!</p>
            </div>

            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Your Login Information:</h3>
              <div style="font-family: monospace; background: #1e293b; color: #10b981; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <div style="margin-bottom: 8px;"><strong>Username:</strong> ${credentials.email}</div>
                <div><strong>Password:</strong> ${credentials.password}</div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${loginUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  🚀 Login & Start Testing
                </a>
              </div>
            </div>

            <h2 style="color: #1e293b; margin: 30px 0 20px 0; font-size: 24px;">As a Beta Tester, You'll Get:</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li><strong>Immediate access</strong> to all ClearMarket features before anyone else</li>
                <li><strong>Direct input</strong> on feature development and improvements</li>
                <li><strong>Priority support</strong> from our development team</li>
                <li><strong>Exclusive beta tester community</strong> access</li>
                <li><strong>Early access credits</strong> to test premium features</li>
                <li><strong>Special recognition</strong> as a founding beta tester</li>
              </ul>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">🔒 Keep Your Credentials Safe</h3>
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                Save these credentials securely. You'll need them to access your beta account and start creating your professional profile.
              </p>
            </div>

            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
                🎯 Ready to shape the future of field inspections? Log in now and start testing!
              </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
              Questions about beta testing? Reply to this email - our team is here to help!<br>
              <strong>The ClearMarket Beta Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Beta confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-beta-confirmation-email function:", error);
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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  recipientEmail: string;
  recipientUsername: string;
  responderUsername: string;
  responderRole: string;
  status: 'accepted' | 'rejected' | 'cancelled';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      recipientUsername,
      responderUsername,
      responderRole,
      status,
    }: RequestBody = await req.json();

    console.log(`Sending connection ${status} email to:`, recipientEmail);

    // Create Supabase client to check user preferences
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recipient's user ID and check preferences
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", recipientEmail)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      throw userError;
    }

    // Check if user has email notifications enabled for new connections
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("email_new_connections")
      .eq("user_id", userData.id)
      .single();

    // If preferences exist and email_new_connections is false, don't send email
    if (preferences && preferences.email_new_connections === false) {
      console.log("User has disabled connection response emails, skipping");
      return new Response(
        JSON.stringify({ message: "Email notification disabled by user" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const roleLabel = responderRole === "field_rep" ? "Field Rep" : "Vendor";
    const isAccepted = status === 'accepted';
    const isCancelled = status === 'cancelled';
    
    let emailTitle = 'Connection Request Declined';
    let emailSubject = `${responderUsername} declined your connection request`;
    let emailBody = '';

    if (isAccepted) {
      emailTitle = 'Connection Request Accepted';
      emailSubject = `${responderUsername} accepted your connection request`;
      emailBody = '<p>You can now message each other and collaborate on ClearMarket.</p>';
    } else if (isCancelled) {
      emailTitle = 'Connection Request Cancelled';
      emailSubject = `${responderUsername} cancelled their connection request`;
      emailBody = '<p>The sender has withdrawn their connection request. You may still connect with other professionals in your area.</p>';
    } else {
      emailBody = '<p>You may want to reach out another time or connect with other professionals in your area.</p>';
    }
    
    const emailHtml = `
      <h2>${emailTitle}</h2>
      <p>Hi ${recipientUsername},</p>
      <p><strong>${responderUsername}</strong> (${roleLabel}) has ${isAccepted ? 'accepted' : isCancelled ? 'cancelled' : 'declined'} ${isCancelled ? 'their' : 'your'} connection request.</p>
      ${emailBody}
      <p><a href="https://bgqlhaqwsnfhhatxhtfx.supabase.co" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">You can manage your email notification preferences in your account settings.</p>
    `;

    const { error } = await resend.emails.send({
      from: "ClearMarket <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log(`Connection ${status} email sent successfully`);

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-connection-response-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
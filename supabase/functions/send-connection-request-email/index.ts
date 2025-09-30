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
  senderUsername: string;
  senderRole: string;
  personalMessage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      recipientUsername,
      senderUsername,
      senderRole,
      personalMessage,
    }: RequestBody = await req.json();

    console.log("Sending connection request email to:", recipientEmail);

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
      console.log("User not found, skipping preference check for non-registered user");
    } else if (userData) {
      // Check if user has email notifications enabled for new connections
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("email_new_connections")
        .eq("user_id", userData.id)
        .single();

      // If preferences exist and email_new_connections is false, don't send email
      if (preferences && preferences.email_new_connections === false) {
        console.log("User has disabled connection request emails, skipping");
        return new Response(
          JSON.stringify({ message: "Email notification disabled by user" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    const roleLabel = senderRole === "vendor" ? "Vendor" : "Field Rep";
    
    const emailHtml = `
      <h2>New Connection Request</h2>
      <p>Hi ${recipientUsername},</p>
      <p><strong>${senderUsername}</strong> (${roleLabel}) wants to connect with you on ClearMarket.</p>
      ${personalMessage ? `<div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3b82f6;"><p style="margin: 0;"><em>"${personalMessage}"</em></p></div>` : ""}
      <p>Log in to your dashboard to review and respond to this request.</p>
      <p><a href="https://bgqlhaqwsnfhhatxhtfx.supabase.co" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Request</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">You can manage your email notification preferences in your account settings.</p>
    `;

    const { error } = await resend.emails.send({
      from: "ClearMarket <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${senderUsername} wants to connect with you`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Connection request email sent successfully");

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-connection-request-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
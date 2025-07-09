import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailTemplates = {
  unlock_confirmation: {
    subject: "Contact Unlocked Successfully",
    html: (data: any) => `
      <h1>Contact Unlocked!</h1>
      <p>Hi ${data.unlockerName},</p>
      <p>You have successfully unlocked contact information for <strong>${data.unlockedName}</strong>.</p>
      <p>You can now view their full profile and contact details in your network.</p>
      <p>Credits used: ${data.creditsUsed}</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `
  },
  welcome: {
    subject: "Welcome to ClearMarket!",
    html: (data: any) => `
      <h1>Welcome to ClearMarket, ${data.name}!</h1>
      <p>Thank you for verifying your email and joining our platform.</p>
      <p>As a ${data.role}, you can now:</p>
      <ul>
        ${data.role === 'vendor' ? 
          '<li>Search for qualified field representatives</li><li>Unlock contact information</li><li>Leave reviews for completed work</li>' :
          '<li>Complete your profile to attract vendors</li><li>Participate in the community board</li><li>Earn credits through helpful contributions</li>'
        }
      </ul>
      <p>Get started by completing your profile!</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `
  },
  boost_expiring: {
    subject: "Your Profile Boost is Expiring Soon",
    html: (data: any) => `
      <h1>Boost Expiring Soon</h1>
      <p>Hi ${data.name},</p>
      <p>Your profile boost will expire in ${data.hoursRemaining} hours.</p>
      <p>To maintain your enhanced visibility in search results, you can purchase another boost from your dashboard.</p>
      <p>Current Trust Score: ${data.trustScore}</p>
      <p>Best regards,<br>The ClearMarket Team</p>
    `
  },
  low_credits: {
    subject: "Running Low on Credits",
    html: (data: any) => `
      <h1>You're Running Low on Credits</h1>
      <p>Hi ${data.name},</p>
      <p>You currently have ${data.creditsRemaining} credits remaining.</p>
      <p>To continue unlocking contacts and using premium features, consider:</p>
      <ul>
        <li>Purchasing more credits</li>
        <li>Earning credits by participating in the community</li>
        <li>Leaving helpful reviews</li>
      </ul>
      <p>Best regards,<br>The ClearMarket Team</p>
    `
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailType, toEmail, userId, templateData } = await req.json();

    if (!emailTemplates[emailType]) {
      throw new Error("Invalid email type");
    }

    const template = emailTemplates[emailType];
    const htmlContent = template.html(templateData || {});

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "ClearMarket <noreply@clearmarket.io>",
      to: [toEmail],
      subject: template.subject,
      html: htmlContent,
    });

    // Log email in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("sent_emails").insert({
      user_id: userId,
      to_email: toEmail,
      subject: template.subject,
      email_type: emailType,
      status: emailResponse.error ? 'failed' : 'sent',
      metadata: { 
        resend_id: emailResponse.data?.id,
        template_data: templateData,
        error: emailResponse.error?.message
      }
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
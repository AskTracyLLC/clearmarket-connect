import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: 'admin' | 'moderator';
  firstName: string;
  lastName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, firstName, lastName }: InvitationRequest = await req.json();

    // Create Supabase client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the current user (admin sending the invitation)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseService.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Invalid authentication');
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const invitationUrl = `https://useclearmarket.io/auth?invitation=${invitationToken}`;

    // Store invitation in database
    const { error: inviteError } = await supabaseService
      .from('user_invitations')
      .insert({
        email,
        role,
        invited_by: userData.user.id,
        invitation_token: invitationToken,
      });

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "ClearMarket <noreply@useclearmarket.io>",
      to: [email],
      subject: `You're invited to join ClearMarket as ${role}`,
      html: `
        <h1>Welcome to ClearMarket!</h1>
        <p>Hi ${firstName},</p>
        <p>You've been invited to join ClearMarket as a <strong>${role}</strong>.</p>
        <p>To complete your registration and set up your profile, please click the link below:</p>
        <p><a href="${invitationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a></p>
        <p>If you can't click the link, copy and paste this URL into your browser:</p>
        <p>${invitationUrl}</p>
        <p>This invitation will expire in 7 days for security reasons.</p>
        <p>Best regards,<br>The ClearMarket Team</p>
      `,
      text: `
        Welcome to ClearMarket!
        
        Hi ${firstName},
        
        You've been invited to join ClearMarket as a ${role}.
        
        To complete your registration and set up your profile, please visit:
        ${invitationUrl}
        
        This invitation will expire in 7 days for security reasons.
        
        Best regards,
        The ClearMarket Team
      `
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Invitation sent successfully',
      emailId: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Invitation sending error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
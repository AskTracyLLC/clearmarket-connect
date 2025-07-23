import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NetworkInvitationRequest {
  inviteType: 'email' | 'username';
  recipientEmail?: string;
  recipientUsername?: string;
  personalMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get sender's profile
    const { data: senderProfile, error: senderError } = await supabase
      .from('users')
      .select('anonymous_username, display_name, role, trust_score')
      .eq('id', user.id)
      .single();

    if (senderError || !senderProfile) {
      throw new Error('Could not fetch sender profile');
    }

    const { 
      inviteType, 
      recipientEmail, 
      recipientUsername, 
      personalMessage 
    }: NetworkInvitationRequest = await req.json();

    console.log('Network invitation request:', { 
      inviteType, 
      recipientEmail, 
      recipientUsername,
      senderUsername: senderProfile.anonymous_username 
    });

    // Determine recipient email and username for the invitation
    let finalRecipientEmail = recipientEmail;
    let finalRecipientUsername = recipientUsername;

    // If inviting by username, try to find the user's email
    if (inviteType === 'username' && recipientUsername) {
      const { data: recipientData } = await supabase
        .from('users')
        .select('id')
        .eq('anonymous_username', recipientUsername)
        .single();

      if (recipientData) {
        // Get the user's email from auth
        const { data: authData } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', recipientData.id)
          .single();

        if (authData?.email) {
          finalRecipientEmail = authData.email;
        }
      }
    }

    // If we have an email, send the invitation
    if (finalRecipientEmail) {
      const invitationUrl = `${supabaseUrl.replace('supabase.co', 'lovableproject.com')}/network?invite=true`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Network Invitation from ${senderProfile.display_name || senderProfile.anonymous_username}</h2>
          
          <p>Hi there,</p>
          
          <p><strong>${senderProfile.display_name || senderProfile.anonymous_username}</strong> (${senderProfile.anonymous_username}) would like to connect with you on ClearMarket!</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">About ${senderProfile.display_name || senderProfile.anonymous_username}:</h3>
            <ul style="margin: 0;">
              <li><strong>Role:</strong> ${senderProfile.role === 'field_rep' ? 'Field Representative' : 'Vendor'}</li>
              <li><strong>Trust Score:</strong> ${senderProfile.trust_score || 50}/100</li>
              <li><strong>Username:</strong> ${senderProfile.anonymous_username}</li>
            </ul>
          </div>
          
          ${personalMessage ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>Personal Message:</strong></p>
              <p style="margin: 10px 0 0 0; font-style: italic;">"${personalMessage}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Network Invitation
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            This invitation will expire in 7 days. If you're not interested, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Sent from ClearMarket - Professional Property Inspection Network
          </p>
        </div>
      `;

      const { error: emailError } = await resend.emails.send({
        from: "ClearMarket <noreply@resend.dev>",
        to: [finalRecipientEmail],
        subject: `Network Invitation from ${senderProfile.display_name || senderProfile.anonymous_username}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        throw emailError;
      }

      console.log("Network invitation email sent successfully to:", finalRecipientEmail);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Network invitation sent successfully',
        emailSent: !!finalRecipientEmail
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-network-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send network invitation'
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
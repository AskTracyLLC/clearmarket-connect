import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StaffInvitationRequest {
  email: string;
  role: 'admin' | 'manager' | 'staff';
  personalMessage?: string;
  vendorOrgId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth header for the supabase client
    supabase.auth.setAuth(authHeader.replace('Bearer ', ''));

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { email, role, personalMessage, vendorOrgId }: StaffInvitationRequest = await req.json();

    // Get vendor organization details
    const { data: vendorOrg, error: orgError } = await supabase
      .from('vendor_organizations')
      .select('company_name')
      .eq('id', vendorOrgId)
      .single();

    if (orgError || !vendorOrg) {
      throw new Error('Vendor organization not found');
    }

    // Get sender's profile
    const { data: senderProfile, error: profileError } = await supabase
      .from('users')
      .select('display_name, anonymous_username')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Sender profile not found');
    }

    const senderName = senderProfile.display_name || senderProfile.anonymous_username || 'A team member';
    const invitationUrl = `https://34544cc9-f36f-4fa8-8a05-17348470ccfc.lovableproject.com/auth?invite=staff&org=${vendorOrgId}&role=${role}`;

    // Prepare email content
    const roleDescriptions = {
      admin: 'full administrative access to manage the team and all company settings',
      manager: 'management access to oversee projects and view reports',
      staff: 'access to messaging and collaboration tools'
    };

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">ClearMarket</h1>
          <p style="color: #6b7280; margin: 5px 0;">Professional Field Services Network</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0;">You've been invited to join ${vendorOrg.company_name}</h2>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 16px 0;">
            ${senderName} has invited you to join their team at ${vendorOrg.company_name} on ClearMarket.
          </p>
          
          <div style="background: white; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Your role will be:</p>
            <p style="margin: 4px 0 0 0; color: #1f2937; font-weight: 600; text-transform: capitalize;">${role}</p>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">This gives you ${roleDescriptions[role]}.</p>
          </div>
          
          ${personalMessage ? `
            <div style="background: white; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Personal message from ${senderName}:</p>
              <p style="margin: 8px 0 0 0; color: #1f2937; font-style: italic;">"${personalMessage}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${invitationUrl}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              Accept Invitation
            </a>
          </div>
        </div>
        
        <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">What is ClearMarket?</h3>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
            ClearMarket is a professional network that connects field representatives with vendor companies for efficient project coordination and quality service delivery.
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
          <p style="margin: 8px 0 0 0;">This invitation was sent by ${senderName} from ${vendorOrg.company_name}.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ClearMarket <team@clearmarket.app>",
      to: [email],
      subject: `Invitation to join ${vendorOrg.company_name} on ClearMarket`,
      html: emailHtml,
    });

    console.log("Staff invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Staff invitation sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-staff-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send staff invitation",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
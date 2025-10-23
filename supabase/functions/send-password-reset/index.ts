import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

// Generate a minimal plain-text fallback from HTML for deliverability
function htmlToText(html: string): string {
  try {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return 'Use this link to reset your ClearMarket password: {{reset_link}}';
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    console.log('Processing password reset for:', email);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Look up user by email to get their username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('anonymous_username')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.log('User not found for email:', email);
      // Return success even if user not found (security best practice)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate password reset link using Supabase Auth
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://useclearmarket.io/reset-password'
      }
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      throw new Error('Failed to generate reset link');
    }

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('name', 'password-reset')
      .single();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      throw new Error('Email template not found: password-reset');
    }

    // Replace template variables (ensure the action link with session tokens is used everywhere)
    const actionLink = resetData.properties?.action_link || '#';
    const replacements = {
      '{{anonymous_username}}': userData.anonymous_username,
      '{{reset_link}}': actionLink,
      '{{action_link}}': actionLink,
      '{{app_redirect}}': actionLink,
      '{{magic_link}}': actionLink,
      '{{company_name}}': 'ClearMarket',
      '{{support_email}}': 'support@useclearmarket.io',
      '{{help_center_url}}': 'https://useclearmarket.io/help'
    };

    let subject = template.subject;
    let htmlContent = template.html_content;

    // Apply replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      subject = subject.replace(new RegExp(placeholder, 'g'), value as string);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value as string);
    });

    console.log('Sending password reset email to:', email);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "ClearMarket <hello@useclearmarket.io>",
      reply_to: "support@useclearmarket.io",
      to: [email],
      subject: subject,
      html: htmlContent,
      text: htmlToText(htmlContent),
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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

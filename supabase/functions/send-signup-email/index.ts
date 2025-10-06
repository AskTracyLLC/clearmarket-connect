import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupEmailRequest {
  signupType: 'field_rep' | 'vendor' | 'field-rep' | 'vendor';
  email: string;
  anonymous_username: string;
  beta_tester?: boolean;
  temp_password?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { signupType, email, anonymous_username, beta_tester = false, temp_password } = requestBody as SignupEmailRequest;

    console.log('Sending signup email:', { signupType, email, anonymous_username, beta_tester, has_password: !!temp_password });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Normalize signup type (handle both formats) - keep dashes for template names
    const normalizedSignupType = signupType === 'field_rep' ? 'field-rep' : 
                                signupType === 'vendor' ? 'vendor' : 
                                signupType; // Already in correct format

    // Determine template name based on signup type and beta status
    const templateName = `${normalizedSignupType}-signup-${beta_tester ? 'beta' : 'standard'}`;
    
    console.log('Looking for template:', templateName);

    // Fetch email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('name', templateName)
      .single();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      throw new Error(`Email template not found: ${templateName}`);
    }

    // Replace template variables
    const replacements = {
      '{{anonymous_username}}': anonymous_username,
      '{{email}}': email,
      '{{user_type}}': normalizedSignupType === 'field_rep' ? 'Field Rep' : 'Vendor',
      '{{registration_link}}': requestBody.registration_link || '#',
      '{{temp_password}}': temp_password || 'N/A'
    };

    let subject = template.subject;
    let htmlContent = template.html_content;

    // Apply replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    });

    console.log('Sending email with subject:', subject);

    const emailResponse = await resend.emails.send({
      from: "ClearMarket <hello@useclearmarket.io>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Signup email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse, template_used: templateName }), {
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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  templateName: string;
  toEmail: string;
  variables: Record<string, any>;
  userId?: string;
}

const supabaseService = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

// Template variable replacement function
function replaceVariables(content: string, variables: Record<string, any>): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateName, toEmail, variables, userId }: EmailRequest = await req.json();

    console.log(`Sending email with template: ${templateName} to: ${toEmail}`);

    // Get email template from database
    const { data: template, error: templateError } = await supabaseService
      .from("system_templates")
      .select("*")
      .eq("template_name", templateName)
      .eq("template_type", "email")
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      console.error("Template not found:", templateError);
      throw new Error(`Email template '${templateName}' not found or inactive`);
    }

    // Replace variables in template content
    const subject = replaceVariables(template.subject || "ClearMarket Notification", variables);
    const htmlContent = replaceVariables(template.html_content, variables);
    const textContent = template.text_content 
      ? replaceVariables(template.text_content, variables) 
      : null;

    console.log(`Sending email with subject: ${subject}`);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "ClearMarket <noreply@useclearmarket.io>",
      to: [toEmail],
      subject: subject,
      html: htmlContent,
      ...(textContent && { text: textContent })
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully:", emailResponse.data?.id);

    // Log email in database
    const { error: logError } = await supabaseService.from("sent_emails").insert({
      user_id: userId,
      to_email: toEmail,
      subject: subject,
      email_type: templateName,
      status: 'sent',
      metadata: { 
        resend_id: emailResponse.data?.id,
        template_variables: variables
      }
    });

    if (logError) {
      console.error("Failed to log email:", logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Email sending error:", error);
    
    // Log failed email attempt
    try {
      await supabaseService.from("sent_emails").insert({
        to_email: "unknown",
        subject: "Failed Email",
        email_type: "error",
        status: 'failed',
        metadata: { 
          error: error.message,
          stack: error.stack
        }
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
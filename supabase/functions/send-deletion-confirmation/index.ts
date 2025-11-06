import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeletionConfirmationRequest {
  toEmail: string;
  subject: string;
  body: string;
  cc?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toEmail, subject, body, cc }: DeletionConfirmationRequest = await req.json();

    console.log("Sending deletion confirmation email to:", toEmail);

    const emailOptions: any = {
      from: "ClearMarket <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      text: body,
    };

    if (cc) {
      emailOptions.cc = [cc];
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Deletion confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending deletion confirmation email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  toEmail: string;
  displayName: string;
  state: string;
  county: string;
  title: string;
  creditsUsed: number;
  newBalance: number;
  coverageRequestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      toEmail, 
      displayName, 
      state, 
      county, 
      title, 
      creditsUsed, 
      newBalance, 
      coverageRequestId 
    }: ReceiptRequest = await req.json();

    console.log("Sending coverage request receipt to:", toEmail);

    const emailBody = `Hi ${displayName || 'User'},

Your coverage request has been posted.

• Display Name: ${displayName || 'User'}
• State: ${state}
• County: ${county}
• Title: ${title}
• Credits Used: ${creditsUsed}
• New Balance: ${newBalance}
• Request ID: ${coverageRequestId}

Thank you for supporting ClearMarket.

Best regards,
The ClearMarket Team`;

    const emailResponse = await resend.emails.send({
      from: "ClearMarket <hello@useclearmarket.io>",
      to: [toEmail],
      cc: ["hello@useclearmarket.io"],
      subject: "Coverage Request Created • 1 Credit Used",
      text: emailBody,
    });

    console.log("Coverage request receipt sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending coverage request receipt:", error);
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

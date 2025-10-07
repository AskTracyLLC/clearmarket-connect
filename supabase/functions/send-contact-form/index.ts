import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  reason: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, reason, subject, message }: ContactFormRequest = await req.json();

    console.log("Processing contact form submission from:", email);

    // Send email to your support inbox
    const emailResponse = await resend.emails.send({
      from: "ClearMarket Contact Form <hello@useclearmarket.io>",
      to: ["hello@useclearmarket.io"],
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log("Contact form email sent successfully:", emailResponse);

    // Send confirmation email to the user
    await resend.emails.send({
      from: "ClearMarket <hello@useclearmarket.io>",
      to: [email],
      subject: "We received your message!",
      html: `
        <h1>Thank you for contacting us, ${firstName}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of what you sent:</p>
        <hr />
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p>Expected response time based on your inquiry type:</p>
        <ul>
          <li><strong>General Inquiries:</strong> 24-48 hours</li>
          <li><strong>Technical Issues:</strong> 4-12 hours</li>
          <li><strong>Billing Questions:</strong> 12-24 hours</li>
        </ul>
        <p>Best regards,<br>The ClearMarket Team</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Need help? Contact us at hello@useclearmarket.io or visit our help center: <a href="https://useclearmarket.io/help">useclearmarket.io/help</a>
        </p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-form function:", error);
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

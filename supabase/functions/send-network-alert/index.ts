import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNetworkAlertRequest {
  alertId: string;
  subject: string;
  messageBody: string;
  filters: {
    states: string[];
    counties: string[];
    systems: string[];
    orderTypes: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { alertId, subject, messageBody, filters }: SendNetworkAlertRequest = await req.json();

    console.log("Processing network alert:", { alertId, subject, filters });

    // Get the vendor's auth header to verify they own this alert
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Verify the alert belongs to the authenticated user
    const { data: alertData, error: alertError } = await supabase
      .from("vendor_network_alerts")
      .select("vendor_id")
      .eq("id", alertId)
      .single();

    if (alertError) {
      throw new Error(`Alert not found: ${alertError.message}`);
    }

    // Get the vendor's user ID from the JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    if (alertData.vendor_id !== user.id) {
      throw new Error("Unauthorized: Alert does not belong to user");
    }

    // Get all connected field reps for this vendor
    const { data: connections, error: connectionsError } = await supabase
      .from("contact_unlocks")
      .select(`
        unlocked_user_id,
        users!contact_unlocks_unlocked_user_id_fkey (
          id,
          display_name,
          role
        ),
        user_profiles!contact_unlocks_unlocked_user_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq("unlocker_id", user.id);

    if (connectionsError) {
      throw new Error(`Failed to get connections: ${connectionsError.message}`);
    }

    // Filter field reps only (exclude vendors)
    const fieldReps = connections?.filter(conn => 
      conn.users?.role === 'field_rep' && 
      conn.user_profiles?.email
    ) || [];

    console.log(`Found ${fieldReps.length} field reps to notify`);

    if (fieldReps.length === 0) {
      // Update alert status
      await supabase
        .from("vendor_network_alerts")
        .update({ 
          status: "sent", 
          sent_at: new Date().toISOString(),
          total_recipients: 0
        })
        .eq("id", alertId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No field reps found to notify",
          recipients: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create email content with ClearMarket branding
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">ClearMarket</h1>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Network Alert from Vendor</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
              <div style="white-space: pre-wrap; margin: 20px 0;">${messageBody}</div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                This message was sent through ClearMarket's Network Alert system.
                <br>
                All recipients are blind-copied for privacy.
              </p>
              <div style="margin-top: 15px;">
                <a href="https://clearmarket.com/unsubscribe" style="color: #6b7280; font-size: 12px; text-decoration: underline;">
                  Unsubscribe from network alerts
                </a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails to all field reps (blind copied)
    const emailPromises = fieldReps.map(async (rep) => {
      const email = rep.user_profiles?.email;
      const name = rep.user_profiles?.first_name || rep.users?.display_name || "Field Rep";
      
      if (!email) return null;

      try {
        const emailResponse = await resend.emails.send({
          from: "ClearMarket Network <alerts@clearmarket.com>",
          to: [email],
          subject: `[ClearMarket] ${subject}`,
          html: emailHtml,
          headers: {
            'List-Unsubscribe': '<https://clearmarket.com/unsubscribe>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          }
        });

        console.log(`Email sent to ${email}:`, emailResponse);

        // Log the recipient
        await supabase
          .from("vendor_network_alert_recipients")
          .insert({
            alert_id: alertId,
            recipient_id: rep.unlocked_user_id,
            sent_at: new Date().toISOString(),
            delivery_status: "sent"
          });

        return { email, success: true, response: emailResponse };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        
        // Log the failed recipient
        await supabase
          .from("vendor_network_alert_recipients")
          .insert({
            alert_id: alertId,
            recipient_id: rep.unlocked_user_id,
            delivery_status: "failed"
          });

        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successfulSends = results.filter(r => r?.success).length;
    const failedSends = results.filter(r => r && !r.success).length;

    console.log(`Email sending completed: ${successfulSends} successful, ${failedSends} failed`);

    // Update alert status
    await supabase
      .from("vendor_network_alerts")
      .update({ 
        status: failedSends > 0 ? "partial" : "sent",
        sent_at: new Date().toISOString(),
        total_recipients: successfulSends
      })
      .eq("id", alertId);

    return new Response(
      JSON.stringify({ 
        success: true,
        recipients: successfulSends,
        failed: failedSends,
        details: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-network-alert function:", error);
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
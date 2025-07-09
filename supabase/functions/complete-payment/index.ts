import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Initialize Stripe and verify session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const creditsToAdd = parseInt(session.metadata?.credits || "0");
    if (creditsToAdd <= 0) {
      throw new Error("Invalid credits amount");
    }

    // Use service role for database updates
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update transaction status
    await supabaseService
      .from("transactions")
      .update({ status: "completed" })
      .eq("provider_transaction_id", sessionId)
      .eq("user_id", user.id);

    // Add credits to user balance
    await supabaseService
      .from("credits")
      .upsert({
        user_id: user.id,
        paid_credits: creditsToAdd,
        current_balance: creditsToAdd
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    // Update existing balance if user already has credits
    const { data: existingCredits } = await supabaseService
      .from("credits")
      .select("current_balance, paid_credits")
      .eq("user_id", user.id)
      .single();

    if (existingCredits) {
      await supabaseService
        .from("credits")
        .update({
          current_balance: (existingCredits.current_balance || 0) + creditsToAdd,
          paid_credits: (existingCredits.paid_credits || 0) + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ success: true, creditsAdded: creditsToAdd }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment completion error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
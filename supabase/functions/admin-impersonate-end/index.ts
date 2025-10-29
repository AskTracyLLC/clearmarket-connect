import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Parse the JWT to get admin ID from the 'act' claim
    const token = authHeader.replace('Bearer ', '');
    let adminId: string;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if this is an impersonation token with 'act' claim (admin ID)
      if (payload.act) {
        adminId = payload.act;
        console.log('Ending impersonation session for admin:', adminId);
      } else {
        // Not an impersonation token, verify normally
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) {
          throw new Error('Unauthorized');
        }
        adminId = user.id;
      }
    } catch (parseError) {
      console.error('Error parsing token:', parseError);
      throw new Error('Invalid token');
    }

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // End the session using the database function
    const { data: ended, error: endError } = await supabaseClient.rpc('end_impersonation_session', {
      session_id_param: session_id
    });

    if (endError || !ended) {
      return new Response(
        JSON.stringify({ error: 'Failed to end session or session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log to audit log
    await supabaseClient
      .from('audit_log')
      .insert({
        user_id: adminId,
        action: 'impersonation_ended',
        target_table: 'impersonation_sessions',
        target_id: session_id,
        metadata: {
          ended_at: new Date().toISOString()
        },
        performed_by_admin: true
      });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

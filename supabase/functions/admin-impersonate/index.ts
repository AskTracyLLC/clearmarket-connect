import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.1.0/index.ts';

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

    // Verify admin user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: canImpersonate } = await supabaseClient.rpc('can_start_impersonation', {
      admin_id_param: user.id
    });

    if (!canImpersonate) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { target_user_id, read_only = true, scopes = [], reason } = body;

    if (!target_user_id || !reason || reason.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters: target_user_id and reason (min 10 chars) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify target user exists and is not admin (unless super permission)
    const { data: targetUser, error: targetError } = await supabaseClient
      .from('users')
      .select('id, role')
      .eq('id', target_user_id)
      .single();

    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admin→admin impersonation
    if (targetUser.role === 'admin') {
      return new Response(
        JSON.stringify({ error: 'Cannot impersonate admin users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client info
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Create impersonation session (15 min expiry)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    const { data: session, error: sessionError } = await supabaseClient
      .from('impersonation_sessions')
      .insert({
        admin_id: user.id,
        target_user_id,
        read_only,
        scopes,
        reason,
        expires_at: expiresAt,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create impersonation session');
    }

    // Generate short-lived JWT with impersonation claims
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const secret = new TextEncoder().encode(jwtSecret);
    
    const jwt = await new jose.SignJWT({
      sub: target_user_id,
      act: user.id, // Actor (admin)
      ro: read_only,
      scope: scopes.join(' '),
      sid: session.id,
      role: 'authenticated',
      aud: 'authenticated'
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .setIssuer(Deno.env.get('SUPABASE_URL') ?? '')
      .sign(secret);

    // Log to audit log
    await supabaseClient
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'impersonation_started',
        target_table: 'impersonation_sessions',
        target_id: session.id,
        metadata: {
          target_user_id,
          read_only,
          scopes,
          reason,
          expires_at: expiresAt
        },
        performed_by_admin: true
      });

    return new Response(
      JSON.stringify({
        access_token: jwt,
        expires_in: 900, // 15 minutes
        session_id: session.id,
        target_user_id,
        read_only,
        scopes
      }),
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

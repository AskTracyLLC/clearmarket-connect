import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId, state, counties, inspectionTypes, platforms } = await req.json();

    console.log('Processing coverage request notification:', { requestId, state, counties });

    // Find field reps with matching coverage areas
    let query = supabaseClient
      .from('coverage_areas')
      .select('user_id, state_code, counties')
      .eq('state_code', state);

    const { data: coverageAreas, error: coverageError } = await query;

    if (coverageError) {
      console.error('Error fetching coverage areas:', coverageError);
      throw coverageError;
    }

    console.log(`Found ${coverageAreas?.length || 0} coverage areas in state ${state}`);

    // Filter to find reps with matching counties or all counties coverage
    const matchingUserIds = new Set<string>();
    
    for (const area of coverageAreas || []) {
      // If the coverage request has specific counties
      if (counties && counties.length > 0) {
        // Check if field rep covers all counties or has matching counties
        if (area.is_all_counties) {
          matchingUserIds.add(area.user_id);
        } else if (area.counties && Array.isArray(area.counties)) {
          // Check if there's any overlap between requested counties and field rep's counties
          // Both should be county names now (e.g., "Milwaukee County")
          const hasOverlap = counties.some((requestedCounty: string) => 
            area.counties.some((repCounty: string) => 
              repCounty.toLowerCase() === requestedCounty.toLowerCase()
            )
          );
          if (hasOverlap) {
            matchingUserIds.add(area.user_id);
          }
        }
      } else {
        // No specific counties requested, any coverage in the state matches
        matchingUserIds.add(area.user_id);
      }
    }

    console.log(`Found ${matchingUserIds.size} field reps with matching coverage`);

    if (matchingUserIds.size === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No matching field reps found',
          notified: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All matching field reps will be notified
    const availableFieldReps = Array.from(matchingUserIds);

    console.log(`Notifying ${availableFieldReps.length} field reps`);

    if (availableFieldReps.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No matching field reps found in coverage areas',
          notified: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the coverage request details for the notification
    const { data: coverageRequest, error: requestError } = await supabaseClient
      .from('coverage_requests')
      .select('title, selected_state, budget_range')
      .eq('id', requestId)
      .single();

    if (requestError) {
      console.error('Error fetching coverage request:', requestError);
      throw requestError;
    }

    // Create notifications for all available field reps
    const notifications = availableFieldReps.map(userId => ({
      user_id: userId,
      type: 'message',
      title: 'New Coverage Request in Your Area',
      message: `A vendor needs coverage in ${coverageRequest.selected_state}. ${coverageRequest.budget_range ? `Budget: ${coverageRequest.budget_range}` : ''}`,
      read: false,
      target_id: requestId,
      target_type: 'coverage_request',
      metadata: {
        state: state,
        counties: counties,
        inspectionTypes: inspectionTypes,
        platforms: platforms
      }
    }));

    const { error: notifyError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notifyError) {
      console.error('Error creating notifications:', notifyError);
      throw notifyError;
    }

    console.log(`Successfully notified ${availableFieldReps.length} field reps`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${availableFieldReps.length} available field reps`,
        notified: availableFieldReps.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-coverage-request function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

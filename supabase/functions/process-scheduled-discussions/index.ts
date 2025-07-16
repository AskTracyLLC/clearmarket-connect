import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledPost {
  id: string;
  discussion_template_id: string;
  scheduled_date: string;
  admin_user_id: string;
  priority: number;
}

interface DiscussionTemplate {
  id: string;
  title: string;
  content: string;
  post_type: string;
  tags: string[];
  category: string;
}

interface CommunityPost {
  title: string;
  content: string;
  user_tags: string[];
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting scheduled discussions processing...');

    // Get current time
    const now = new Date();
    
    // Get posts due for posting (within the last hour to account for timing)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const { data: duePosts, error: duePostsError } = await supabaseClient
      .from('scheduled_discussion_posts')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_date', oneHourAgo.toISOString())
      .lte('scheduled_date', now.toISOString());

    if (duePostsError) {
      console.error('Error fetching due posts:', duePostsError);
      throw duePostsError;
    }

    console.log(`Found ${duePosts?.length || 0} posts due for processing`);

    if (!duePosts || duePosts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts due for processing', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get scheduler settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('scheduler_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching scheduler settings:', settingsError);
      // Use defaults if no settings found
    }

    const conflictDetectionEnabled = settings?.conflict_detection_enabled ?? true;
    const lookbackDays = settings?.lookback_days ?? 14;
    const similarityThreshold = settings?.similarity_threshold ?? 0.3;
    const conflictAction = settings?.conflict_action ?? 'skip';

    let processedCount = 0;
    let skippedCount = 0;

    for (const scheduledPost of duePosts) {
      try {
        console.log(`Processing scheduled post: ${scheduledPost.id}`);

        // Get the discussion template
        const { data: template, error: templateError } = await supabaseClient
          .from('discussion_templates')
          .select('*')
          .eq('id', scheduledPost.discussion_template_id)
          .single();

        if (templateError) {
          console.error('Error fetching template:', templateError);
          continue;
        }

        let shouldSkip = false;
        let conflictReason = '';

        // Check for conflicts if enabled
        if (conflictDetectionEnabled) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

          // Get recent posts for conflict detection
          const { data: recentPosts, error: recentPostsError } = await supabaseClient
            .from('community_posts')
            .select('title, content, user_tags, created_at')
            .gte('created_at', cutoffDate.toISOString());

          if (recentPostsError) {
            console.error('Error fetching recent posts:', recentPostsError);
          } else if (recentPosts) {
            // Check for similar topics
            const conflict = await detectConflict(template, recentPosts, similarityThreshold);
            
            if (conflict.found) {
              console.log(`Conflict detected for ${scheduledPost.id}: ${conflict.reason}`);
              
              if (conflictAction === 'skip') {
                shouldSkip = true;
                conflictReason = conflict.reason;
              } else if (conflictAction === 'ask') {
                // Mark for manual review
                await supabaseClient
                  .from('scheduled_discussion_posts')
                  .update({
                    status: 'conflict_detected',
                    conflict_reason: conflict.reason,
                    updated_at: now.toISOString()
                  })
                  .eq('id', scheduledPost.id);
                
                skippedCount++;
                continue;
              }
              // For 'post_anyway', continue with posting
            }
          }
        }

        if (shouldSkip) {
          // Mark as skipped
          await supabaseClient
            .from('scheduled_discussion_posts')
            .update({
              status: 'skipped',
              conflict_reason: conflictReason,
              updated_at: now.toISOString()
            })
            .eq('id', scheduledPost.id);
          
          skippedCount++;
          console.log(`Skipped post ${scheduledPost.id} due to conflict`);
          continue;
        }

        // Create the community post
        const { data: newPost, error: postError } = await supabaseClient
          .from('community_posts')
          .insert({
            user_id: scheduledPost.admin_user_id,
            title: template.title,
            content: template.content,
            post_type: template.post_type,
            user_tags: template.tags,
            section: 'field-rep-forum',
            board_type: 'field-rep-forum',
            is_anonymous: false,
            created_at: now.toISOString()
          })
          .select('id')
          .single();

        if (postError) {
          console.error('Error creating community post:', postError);
          continue;
        }

        // Update scheduled post status
        await supabaseClient
          .from('scheduled_discussion_posts')
          .update({
            status: 'posted',
            posted_at: now.toISOString(),
            posted_post_id: newPost.id,
            updated_at: now.toISOString()
          })
          .eq('id', scheduledPost.id);

        processedCount++;
        console.log(`Successfully posted discussion: ${template.title}`);

      } catch (error) {
        console.error(`Error processing scheduled post ${scheduledPost.id}:`, error);
      }
    }

    const result = {
      message: 'Scheduled discussions processed',
      processed: processedCount,
      skipped: skippedCount,
      total: duePosts.length
    };

    console.log('Processing complete:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-scheduled-discussions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Conflict detection helper function
async function detectConflict(
  template: DiscussionTemplate, 
  recentPosts: CommunityPost[], 
  threshold: number
): Promise<{ found: boolean; reason: string }> {
  const templateWords = extractKeywords(template.title + ' ' + template.content);
  const templateTags = template.tags;

  for (const post of recentPosts) {
    const postWords = extractKeywords((post.title || '') + ' ' + post.content);
    const postTags = post.user_tags || [];

    // Calculate word similarity
    const wordSimilarity = calculateWordSimilarity(templateWords, postWords);
    
    // Calculate tag similarity
    const tagSimilarity = calculateTagSimilarity(templateTags, postTags);
    
    // Combine similarities (weighted average)
    const overallSimilarity = (wordSimilarity * 0.7) + (tagSimilarity * 0.3);

    if (overallSimilarity >= threshold) {
      const daysAgo = Math.ceil((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return {
        found: true,
        reason: `Similar topic "${post.title || 'Untitled'}" posted ${daysAgo} day(s) ago (${Math.round(overallSimilarity * 100)}% similarity)`
      };
    }
  }

  return { found: false, reason: '' };
}

// Extract meaningful keywords from text
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'what', 'how', 'when', 'where', 'why', 'your', 'you', 'they', 'them', 'their', 'this', 'that', 'these', 'those']);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 20); // Limit to top 20 keywords
}

// Calculate similarity between two sets of words
function calculateWordSimilarity(words1: string[], words2: string[]): number {
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Calculate similarity between two sets of tags
function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0;
  
  const set1 = new Set(tags1.map(tag => tag.toLowerCase()));
  const set2 = new Set(tags2.map(tag => tag.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}
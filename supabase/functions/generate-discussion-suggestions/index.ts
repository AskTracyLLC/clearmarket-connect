import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommunityInsight {
  type: 'trending_topic' | 'engagement_gap' | 'user_question';
  title: string;
  topic: string;
  rationale: string;
  confidence: number;
  tags: string[];
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminUserId } = await req.json();

    if (!adminUserId) {
      throw new Error('Admin user ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze recent community activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent posts and their engagement
    const { data: recentPosts, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (postsError) throw postsError;

    // Get recent comments
    const { data: recentComments, error: commentsError } = await supabase
      .from('community_comments')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (commentsError) throw commentsError;

    // Analyze community insights
    const insights = await analyzeCommunityActivity(recentPosts, recentComments);

    // Generate AI-powered suggestions based on insights
    const suggestions = await generateSuggestions(insights);

    // Save suggestions to database
    const savedSuggestions = [];
    for (const suggestion of suggestions) {
      const { data, error } = await supabase
        .from('discussion_suggestions')
        .insert({
          admin_user_id: adminUserId,
          suggested_title: suggestion.title,
          suggested_topic: suggestion.topic,
          rationale: suggestion.rationale,
          confidence_score: suggestion.confidence,
          tags: suggestion.tags,
          category: suggestion.category
        })
        .select()
        .single();

      if (!error) {
        savedSuggestions.push(data);
      }
    }

    return new Response(JSON.stringify({ 
      suggestions: savedSuggestions,
      insights: insights.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeCommunityActivity(posts: any[], comments: any[]): Promise<CommunityInsight[]> {
  const insights: CommunityInsight[] = [];

  // 1. Identify trending topics (frequently mentioned tags/keywords)
  const tagFrequency: Record<string, number> = {};
  posts.forEach(post => {
    if (post.user_tags) {
      post.user_tags.forEach((tag: string) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    }
  });

  // Find trending tags (mentioned 3+ times)
  const trendingTags = Object.entries(tagFrequency)
    .filter(([_, count]) => count >= 3)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  for (const [tag, count] of trendingTags) {
    insights.push({
      type: 'trending_topic',
      title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Best Practices Discussion`,
      topic: `Let's discuss best practices and common challenges around ${tag}. What strategies have worked well for you?`,
      rationale: `"${tag}" has been mentioned ${count} times recently, indicating high community interest`,
      confidence: Math.min(0.9, 0.5 + (count * 0.1)),
      tags: [tag, 'best-practices', 'community-discussion'],
      category: 'discussion'
    });
  }

  // 2. Identify engagement gaps (topics with low responses)
  const lowEngagementPosts = posts
    .filter(post => post.helpful_votes < 2 && post.created_at > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .slice(0, 2);

  for (const post of lowEngagementPosts) {
    insights.push({
      type: 'engagement_gap',
      title: `Revisiting: ${post.title}`,
      topic: `This important topic didn't get much discussion recently. Let's give it another look: ${post.content.substring(0, 200)}...`,
      rationale: `Low engagement on relevant topic - community may need more discussion`,
      confidence: 0.6,
      tags: post.user_tags || ['follow-up', 'community-input'],
      category: 'discussion'
    });
  }

  // 3. Generate general community building suggestions
  if (insights.length < 2) {
    insights.push({
      type: 'user_question',
      title: 'Weekly Field Rep Check-in',
      topic: 'How has everyone\'s week been? Share your wins, challenges, and any interesting properties you\'ve encountered. Let\'s support each other!',
      rationale: 'Regular community check-ins boost engagement and connection',
      confidence: 0.8,
      tags: ['weekly-checkin', 'community', 'support'],
      category: 'discussion'
    });
  }

  return insights.slice(0, 3); // Return top 3 insights
}

async function generateSuggestions(insights: CommunityInsight[]): Promise<CommunityInsight[]> {
  // For now, return insights as suggestions
  // In a real implementation, this could use OpenAI to enhance the suggestions
  return insights.map(insight => ({
    ...insight,
    // Add some variety to titles and topics
    title: insight.title,
    topic: insight.topic
  }));
}
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  title: string;
  content: string;
  tags: string[];
  category: string;
}

interface SimilarPost {
  id: string;
  title: string;
  content: string;
  similarity: number;
  created_at: string;
  helpful_votes: number;
  comments_count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, tags, category }: AnalysisRequest = await req.json();

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate content hash for caching
    const contentHash = await generateContentHash(title + content + tags.join(''));

    // Check cache first
    const { data: cachedAnalysis } = await supabase
      .from('content_similarity_cache')
      .select('*')
      .eq('content_hash', contentHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedAnalysis) {
      return new Response(JSON.stringify(cachedAnalysis.similar_posts), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get recent posts (last 60 days) for comparison
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: recentPosts, error: postsError } = await supabase
      .from('community_posts')
      .select(`
        id, title, content, user_tags, created_at, helpful_votes
      `)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    // Calculate similarity scores
    const similarPosts: SimilarPost[] = [];
    
    for (const post of recentPosts || []) {
      const similarity = calculateSimilarity(
        { title, content, tags },
        { 
          title: post.title, 
          content: post.content, 
          tags: post.user_tags || [] 
        }
      );

      if (similarity > 0.3) { // Only include posts with 30%+ similarity
        similarPosts.push({
          id: post.id,
          title: post.title,
          content: post.content,
          similarity,
          created_at: post.created_at,
          helpful_votes: post.helpful_votes || 0,
          comments_count: 0 // We'll fetch this separately if needed
        });
      }
    }

    // Sort by similarity score (highest first)
    similarPosts.sort((a, b) => b.similarity - a.similarity);

    // Calculate overall conflict score
    const conflictScore = calculateConflictScore(similarPosts);

    // Generate recommendations
    const recommendations = generateRecommendations(conflictScore, similarPosts);

    const analysisResult = {
      similarPosts: similarPosts.slice(0, 5), // Return top 5 similar posts
      conflictScore,
      recommendations
    };

    // Cache the results
    await supabase
      .from('content_similarity_cache')
      .insert({
        content_hash: contentHash,
        similar_posts: analysisResult
      });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      similarPosts: [],
      conflictScore: 0,
      recommendations: {
        action: 'post_now',
        reasoning: 'Analysis unavailable, but no conflicts detected'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateSimilarity(
  newPost: { title: string; content: string; tags: string[] },
  existingPost: { title: string; content: string; tags: string[] }
): number {
  // 1. Title similarity (40% weight)
  const titleSimilarity = getTextSimilarity(newPost.title, existingPost.title);
  
  // 2. Content similarity (40% weight) - compare first 300 characters
  const contentSimilarity = getTextSimilarity(
    newPost.content.substring(0, 300),
    existingPost.content.substring(0, 300)
  );
  
  // 3. Tag overlap (20% weight)
  const tagSimilarity = getTagSimilarity(newPost.tags, existingPost.tags);
  
  return (titleSimilarity * 0.4) + (contentSimilarity * 0.4) + (tagSimilarity * 0.2);
}

function getTextSimilarity(text1: string, text2: string): number {
  // Simple word-based similarity
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

function getTagSimilarity(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 && tags2.length === 0) return 0;
  if (tags1.length === 0 || tags2.length === 0) return 0;
  
  const intersection = tags1.filter(tag => tags2.includes(tag));
  const union = [...new Set([...tags1, ...tags2])];
  
  return intersection.length / union.length;
}

function calculateConflictScore(similarPosts: SimilarPost[]): number {
  if (similarPosts.length === 0) return 0;
  
  // Weight recent posts more heavily
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const post of similarPosts.slice(0, 3)) { // Consider top 3 most similar
    const daysSincePost = Math.max(1, (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const recencyWeight = Math.max(0.1, 1 / Math.sqrt(daysSincePost)); // Recent posts have higher weight
    
    weightedScore += post.similarity * recencyWeight;
    totalWeight += recencyWeight;
  }
  
  return totalWeight > 0 ? Math.min(1, weightedScore / totalWeight) : 0;
}

function generateRecommendations(conflictScore: number, similarPosts: SimilarPost[]) {
  if (conflictScore >= 0.7) {
    const mostSimilarPost = similarPosts[0];
    const daysSince = Math.ceil((Date.now() - new Date(mostSimilarPost.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      action: 'revise' as const,
      reasoning: `High similarity (${Math.round(conflictScore * 100)}%) to recent content. Consider revising or waiting ${14 - daysSince} more days.`,
      recommendedDate: new Date(Date.now() + (14 - daysSince) * 24 * 60 * 60 * 1000).toISOString()
    };
  } else if (conflictScore >= 0.4) {
    const recommendedDays = 7;
    return {
      action: 'schedule' as const,
      reasoning: `Moderate similarity detected (${Math.round(conflictScore * 100)}%). Recommend scheduling for better spacing.`,
      recommendedDate: new Date(Date.now() + recommendedDays * 24 * 60 * 60 * 1000).toISOString()
    };
  } else {
    return {
      action: 'post_now' as const,
      reasoning: `Low conflict score (${Math.round(conflictScore * 100)}%). Great timing for this discussion!`
    };
  }
}

async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
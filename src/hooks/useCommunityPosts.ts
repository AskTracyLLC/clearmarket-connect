import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  helpful_votes: number;
  flagged: boolean;
  user_id: string;
  users: {
    display_name: string;
    role: string;
  };
  hasUserVoted?: boolean;
}

export const useCommunityPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          users:user_id (
            display_name,
            role
          )
        `)
        .eq('flagged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if current user has voted on each post
      let postsWithVoteStatus = data || [];
      if (user) {
        const postIds = data?.map(post => post.id) || [];
        if (postIds.length > 0) {
          const { data: userVotes } = await supabase
            .from('helpful_votes')
            .select('target_id')
            .eq('voter_id', user.id)
            .eq('target_type', 'post')
            .in('target_id', postIds);

          const votedPostIds = new Set(userVotes?.map(vote => vote.target_id) || []);
          
          postsWithVoteStatus = (data || []).map(post => ({
            ...post,
            hasUserVoted: votedPostIds.has(post.id)
          }));
        }
      }

      setPosts(postsWithVoteStatus);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          content: content.trim(),
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been shared with the community!",
      });

      // Refresh posts
      await fetchPosts();
      return true;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const voteOnPost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('helpful_votes')
        .select('*')
        .eq('target_id', postId)
        .eq('target_type', 'post')
        .eq('voter_id', user.id)
        .maybeSingle();

      if (existingVote) {
        // Remove vote
        const { error: deleteError } = await supabase
          .from('helpful_votes')
          .delete()
          .eq('target_id', postId)
          .eq('target_type', 'post')
          .eq('voter_id', user.id);

        if (deleteError) throw deleteError;

        // Decrement helpful_votes count on the post
        const { data: currentPost } = await supabase
          .from('community_posts')
          .select('helpful_votes')
          .eq('id', postId)
          .single();

        if (currentPost) {
          const { error: updateError } = await supabase
            .from('community_posts')
            .update({
              helpful_votes: Math.max(0, (currentPost.helpful_votes || 0) - 1)
            })
            .eq('id', postId);

          if (updateError) throw updateError;
        }

        toast({
          title: "Vote removed",
          description: "Your vote has been removed from this post.",
        });
      } else {
        // Add vote
        const { error: insertError } = await supabase
          .from('helpful_votes')
          .insert({
            target_id: postId,
            target_type: 'post',
            voter_id: user.id
          });

        if (insertError) throw insertError;

        // Get current post to increment votes
        const { data: currentPost } = await supabase
          .from('community_posts')
          .select('helpful_votes')
          .eq('id', postId)
          .single();

        if (currentPost) {
          const { error: updateError } = await supabase
            .from('community_posts')
            .update({
              helpful_votes: (currentPost.helpful_votes || 0) + 1
            })
            .eq('id', postId);

          if (updateError) throw updateError;
        }

        toast({
          title: "Vote recorded",
          description: "Thank you for your feedback!",
        });
      }

      // Refresh posts
      await fetchPosts();
    } catch (error: any) {
      console.error('Error voting on post:', error);
      toast({
        title: "Error voting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const flagPost = async (postId: string, reason?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user can create flags (rate limiting)
      const { data: canFlag } = await supabase
        .rpc('can_create_flag', { user_id: user.id });

      if (!canFlag) {
        toast({
          title: "Rate limit exceeded",
          description: "You can only report 5 items per day.",
          variant: "destructive",
        });
        return;
      }

      // Create flag
      const { error } = await supabase
        .from('flags')
        .insert({
          target_id: postId,
          target_type: 'post',
          flagged_by: user.id,
          reason: reason || 'Inappropriate content'
        });

      if (error) throw error;

      toast({
        title: "Post reported",
        description: "Thank you for helping keep our community safe. This post has been reported for review.",
      });
    } catch (error: any) {
      console.error('Error flagging post:', error);
      toast({
        title: "Error reporting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    voteOnPost,
    flagPost,
    refetch: fetchPosts
  };
};
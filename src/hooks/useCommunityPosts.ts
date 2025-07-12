import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface CommunityPost {
  id: string;
  title?: string;
  content: string;
  post_type: string;
  section: string;
  user_id: string;
  is_anonymous: boolean;
  helpful_votes: number;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  user_tags: string[];
  system_tags: string[];
  screenshots?: string[];
}

export const useCommunityPosts = (section?: string) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setPosts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, type: 'helpful' | 'not-helpful') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote on posts",
          variant: "destructive"
        });
        return;
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('helpful_votes')
        .select('id')
        .eq('target_id', postId)
        .eq('target_type', 'post')
        .eq('voter_id', user.id)
        .single();

      if (existingVote) {
        // Remove existing vote
        await supabase
          .from('helpful_votes')
          .delete()
          .eq('id', existingVote.id);

        // Update post helpful_votes count
        const post = posts.find(p => p.id === postId);
        if (post) {
          await supabase
            .from('community_posts')
            .update({ helpful_votes: Math.max(0, post.helpful_votes - 1) })
            .eq('id', postId);
        }
      } else if (type === 'helpful') {
        // Add new helpful vote
        await supabase
          .from('helpful_votes')
          .insert({
            target_id: postId,
            target_type: 'post',
            voter_id: user.id
          });

        // Update post helpful_votes count
        const post = posts.find(p => p.id === postId);
        if (post) {
          await supabase
            .from('community_posts')
            .update({ helpful_votes: post.helpful_votes + 1 })
            .eq('id', postId);
        }
      }

      // Refresh posts
      fetchPosts();
    } catch (err: any) {
      console.error('Error voting:', err);
      toast({
        title: "Error",
        description: "Failed to vote on post",
        variant: "destructive"
      });
    }
  };

  const handleFlag = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to flag posts",
          variant: "destructive"
        });
        return;
      }

      await supabase
        .from('flags')
        .insert({
          target_id: postId,
          target_type: 'post',
          flagged_by: user.id,
          reason: 'User reported content'
        });

      toast({
        title: "Post flagged",
        description: "Thank you for helping keep our community safe"
      });
    } catch (err: any) {
      console.error('Error flagging post:', err);
      toast({
        title: "Error",
        description: "Failed to flag post",
        variant: "destructive"
      });
    }
  };

  const handleCreatePost = async (newPost: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
    userTags: string[];
    section: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create posts",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          post_type: newPost.type,
          section: newPost.section,
          user_id: user.id,
          is_anonymous: newPost.isAnonymous,
          system_tags: newPost.systemTags,
          user_tags: newPost.userTags
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Post created",
        description: "Your post has been published successfully"
      });

      // Refresh posts
      fetchPosts();
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [section]);

  return {
    posts,
    selectedPost,
    setSelectedPost,
    loading,
    error,
    handleVote,
    handleFlag,
    handleCreatePost,
    refetch: fetchPosts
  };
};
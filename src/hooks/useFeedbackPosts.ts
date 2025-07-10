import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeedbackPost {
  id: string;
  title: string;
  description: string;
  category: 'bug-report' | 'feature-request';
  status: 'under-review' | 'planned' | 'in-progress' | 'completed' | 'closed';
  upvotes: number;
  userHasUpvoted: boolean;
  userIsFollowing: boolean;
  author: string;
  createdAt: string;
  user_id: string;
}

export interface FeedbackComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export const useFeedbackPosts = () => {
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts: FeedbackPost[] = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category as 'bug-report' | 'feature-request',
        status: post.status as 'under-review' | 'planned' | 'in-progress' | 'completed' | 'closed',
        upvotes: post.upvotes || 0,
        userHasUpvoted: false, // TODO: Implement upvote tracking
        userIsFollowing: false, // TODO: Implement follow tracking
        author: post.author,
        createdAt: new Date(post.created_at).toISOString().split('T')[0],
        user_id: post.user_id
      }));

      setPosts(transformedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback posts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (newPost: { title: string; description: string; category: string }, feedbackUser?: any) => {
    try {
      // Check if we have a feedback user (token-based auth) or regular auth user
      let author = 'Anonymous';
      let userId = null;
      
      if (feedbackUser) {
        // Use feedback user info
        author = feedbackUser.anonymousUsername || feedbackUser.email || 'Anonymous';
        userId = null; // For feedback posts, we don't need to link to auth.users
      } else {
        // Try regular Supabase auth as fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          author = user.email || 'Anonymous';
          userId = user.id;
        }
      }

      const { error } = await supabase
        .from('feedback_posts')
        .insert({
          title: newPost.title,
          description: newPost.description,
          category: newPost.category,
          author: author,
          user_id: userId
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. It will be reviewed by our team.",
      });

      await fetchPosts(); // Refresh the posts
      return true;
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePost = async (postId: string, updates: Partial<FeedbackPost>) => {
    try {
      const { error } = await supabase
        .from('feedback_posts')
        .update(updates)
        .eq('id', postId);

      if (error) throw error;

      await fetchPosts(); // Refresh the posts
      return true;
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost
  };
};
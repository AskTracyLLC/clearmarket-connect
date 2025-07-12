import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Real data interface matching Supabase schema with both user tables
export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  helpful_votes: number;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  // Joined user data from both tables
  user?: {
    display_name: string | null;  // from users table (customizable)
    role: string;
    trust_score: number | null;
    community_score: number | null;
  };
  user_profile?: {
    username: string | null;      // from user_profiles table (anonymous_username)
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  // Calculated fields for UI
  isFollowed?: boolean;
  isSaved?: boolean;
  comments?: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  helpful_votes: number;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string | null;
    role: string;
    trust_score: number | null;
    community_score: number | null;
  };
  user_profile?: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export const usePostManagement = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to get the display name with proper priority
  const getDisplayName = (user: any, userProfile: any): string => {
    // 1. First priority: anonymous_username from user_profiles.username
    if (userProfile?.username) {
      return userProfile.username;
    }
    
    // 2. Second priority: custom display_name from users table
    if (user?.display_name) {
      return user.display_name;
    }
    
    // 3. Third priority: constructed name from user_profiles
    if (userProfile?.first_name || userProfile?.last_name) {
      const firstName = userProfile.first_name || "";
      const lastName = userProfile.last_name || "";
      return `${firstName} ${lastName}`.trim() || "Anonymous User";
    }
    
    // 4. Final fallback
    return "Anonymous User";
  };

  // Fetch posts with both user and user_profile data
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users!community_posts_user_id_fkey(
            display_name,
            role,
            trust_score,
            community_score
          ),
          user_profile:user_profiles!inner(
            username,
            first_name,
            last_name,
            email
          )
        `)
        .eq('flagged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data for UI
      const transformedPosts = (data || []).map(post => ({
        ...post,
        isFollowed: false, // TODO: Check user's followed posts
        isSaved: false,    // TODO: Check user's saved posts
        comments: [],      // TODO: Load comments separately or join
      }));

      setPosts(transformedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a specific post with both user tables
  const fetchPostComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          user:users!community_comments_user_id_fkey(
            display_name,
            role,
            trust_score,
            community_score
          ),
          user_profile:user_profiles!inner(
            username,
            first_name,
            last_name,
            email
          )
        `)
        .eq('post_id', postId)
        .eq('flagged', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  // Handle helpful vote
  const handleVote = async (postId: string, type: 'helpful' | 'not-helpful') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to vote on posts.",
          variant: "destructive",
        });
        return;
      }

      if (type === 'helpful') {
        // Check if user already voted
        const { data: existingVote } = await supabase
          .from('helpful_votes')
          .select('id')
          .eq('voter_id', user.id)
          .eq('target_id', postId)
          .eq('target_type', 'post')
          .maybeSingle();

        if (existingVote) {
          toast({
            title: "Already Voted",
            description: "You have already voted on this post.",
            variant: "destructive",
          });
          return;
        }

        // Add vote
        const { error: voteError } = await supabase
          .from('helpful_votes')
          .insert({
            voter_id: user.id,
            target_id: postId,
            target_type: 'post'
          });

        if (voteError) throw voteError;

        // Update post helpful votes count
        const currentPost = posts.find(p => p.id === postId);
        const newVoteCount = (currentPost?.helpful_votes || 0) + 1;
        
        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ helpful_votes: newVoteCount })
          .eq('id', postId);

        if (updateError) throw updateError;

        // Update local state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId 
              ? { ...post, helpful_votes: newVoteCount }
              : post
          )
        );

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ 
            ...selectedPost, 
            helpful_votes: newVoteCount
          });
        }

        toast({
          title: "Vote Recorded",
          description: "Your helpful vote has been recorded.",
        });
      }
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  // Handle comment vote
  const handleReplyVote = async (commentId: string, type: 'helpful' | 'not-helpful') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required", 
          description: "Please log in to vote on comments.",
          variant: "destructive",
        });
        return;
      }

      if (type === 'helpful') {
        // Check if user already voted
        const { data: existingVote } = await supabase
          .from('helpful_votes')
          .select('id')
          .eq('voter_id', user.id)
          .eq('target_id', commentId)
          .eq('target_type', 'comment')
          .maybeSingle();

        if (existingVote) {
          toast({
            title: "Already Voted",
            description: "You have already voted on this comment.",
            variant: "destructive",
          });
          return;
        }

        // Add vote and update comment
        const { error: voteError } = await supabase
          .from('helpful_votes')
          .insert({
            voter_id: user.id,
            target_id: commentId,
            target_type: 'comment'
          });

        if (voteError) throw voteError;

        // Update comment helpful votes count
        const currentComment = selectedPost?.comments?.find(c => c.id === commentId);
        const newVoteCount = (currentComment?.helpful_votes || 0) + 1;
        
        const { error: updateError } = await supabase
          .from('community_comments')
          .update({ helpful_votes: newVoteCount })
          .eq('id', commentId);

        if (updateError) throw updateError;

        // Update local state for selected post comments
        if (selectedPost) {
          const updatedComments = selectedPost.comments?.map(comment =>
            comment.id === commentId 
              ? { ...comment, helpful_votes: newVoteCount }
              : comment
          ) || [];
          
          setSelectedPost({ ...selectedPost, comments: updatedComments });
        }

        toast({
          title: "Vote Recorded", 
          description: "Your helpful vote on the comment has been recorded.",
        });
      }
    } catch (error: any) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: "Failed to record comment vote",
        variant: "destructive",
      });
    }
  };

  // Handle flag post
  const handleFlag = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to flag posts.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('flags')
        .insert({
          flagged_by: user.id,
          target_type: 'post',
          target_id: postId,
          reason: 'User reported content'
        });

      if (error) throw error;

      toast({
        title: "Post Flagged",
        description: "This post has been flagged for review by moderators.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('Error flagging post:', error);
      toast({
        title: "Error",
        description: "Failed to flag post",
        variant: "destructive",
      });
    }
  };

  // Handle follow/unfollow (mock implementation)
  const handleFollow = async (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isFollowed: !post.isFollowed } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isFollowed: !selectedPost.isFollowed });
    }

    const isCurrentlyFollowed = posts.find(p => p.id === postId)?.isFollowed;
    toast({
      title: isCurrentlyFollowed ? "Unfollowed Post" : "Following Post",
      description: isCurrentlyFollowed 
        ? "You'll no longer receive notifications for this post."
        : "You'll be notified of new replies to this post.",
    });
  };

  // Handle save/unsave (mock implementation)
  const handleSave = async (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isSaved: !selectedPost.isSaved });
    }

    const isCurrentlySaved = posts.find(p => p.id === postId)?.isSaved;
    toast({
      title: isCurrentlySaved ? "Post Unsaved" : "Post Saved",
      description: isCurrentlySaved
        ? "This post has been removed from your collection."
        : "This post has been saved to your collection.",
    });
  };

  // Handle resolve (for moderators)
  const handleResolve = async (postId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Post resolution is in development.",
    });
  };

  // Handle pin reply (for moderators)
  const handlePinReply = async (commentId: string) => {
    toast({
      title: "Feature Coming Soon", 
      description: "Comment pinning is in development.",
    });
  };

  // Create new post
  const handleCreatePost = async (postData: {
    content: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create posts.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          helpful_votes: 0,
          flagged: false
        })
        .select(`
          *,
          user:users!community_posts_user_id_fkey(
            display_name,
            role,
            trust_score,
            community_score
          ),
          user_profile:user_profiles!inner(
            username,
            first_name,
            last_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      // Add to posts list
      const newPost = {
        ...data,
        isFollowed: false,
        isSaved: false,
        comments: []
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);

      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // When a post is selected, load its comments
  useEffect(() => {
    const loadSelectedPostComments = async () => {
      if (selectedPost && selectedPost.id) {
        const comments = await fetchPostComments(selectedPost.id);
        setSelectedPost(prev => prev ? { ...prev, comments } : null);
      }
    };

    loadSelectedPostComments();
  }, [selectedPost?.id]);

  return {
    posts,
    selectedPost,
    setSelectedPost,
    loading,
    handleVote,
    handleReplyVote,
    handleFlag,
    handleFollow,
    handleSave,
    handleResolve,
    handlePinReply,
    handleCreatePost,
    getDisplayName,
    fetchPosts
  };
};

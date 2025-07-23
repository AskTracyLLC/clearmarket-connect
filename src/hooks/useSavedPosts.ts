import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CommunityPost } from "./useCommunityPosts";

export interface SavedPost extends CommunityPost {
  saved_at: string;
}

export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          created_at,
          community_posts (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts = (data || []).map((item: any) => ({
        ...item.community_posts,
        saved_at: item.created_at,
        author_display_name: 'Community Member',
        author_anonymous_username: `User${item.community_posts.user_id.slice(-4)}`,
        author_role: 'member',
        author_trust_score: 50,
        author_community_score: 25
      }));

      setSavedPosts(transformedPosts);
    } catch (err: any) {
      console.error('Error fetching saved posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSavePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save posts",
          variant: "destructive"
        });
        return;
      }

      // Check if already saved
      const { data: existingSave } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingSave) {
        // Remove from saved
        await supabase
          .from('saved_posts')
          .delete()
          .eq('id', existingSave.id);

        toast({
          title: "Post unsaved",
          description: "Post removed from your saved collection"
        });
      } else {
        // Add to saved
        await supabase
          .from('saved_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        toast({
          title: "Post saved",
          description: "Post added to your saved collection"
        });
      }

      fetchSavedPosts();
    } catch (err: any) {
      console.error('Error toggling save status:', err);
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive"
      });
    }
  };

  const isPostSaved = async (postId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return {
    savedPosts,
    loading,
    toggleSavePost,
    isPostSaved,
    refetch: fetchSavedPosts
  };
};
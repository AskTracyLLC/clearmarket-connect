import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface TrendingTag {
  tag_name: string;
  tag_count: number;
}

export interface UseTrendingTagsOptions {
  daysBack?: number;
  tagLimit?: number;
  section?: 'field-rep-forum' | 'vendor-bulletin' | null;
  enabled?: boolean;
}

export const useTrendingTags = (options: UseTrendingTagsOptions = {}) => {
  const {
    daysBack = 30,
    tagLimit = 5,
    section = null,
    enabled = true
  } = options;

  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrendingTags = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Call the database function we created
      const { data, error: dbError } = await supabase.rpc('get_trending_tags', {
        days_back: daysBack,
        tag_limit: tagLimit,
        section_filter: section
      });

      if (dbError) {
        throw new Error(`Failed to fetch trending tags: ${dbError.message}`);
      }

      setTrendingTags(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching trending tags:', err);
      
      // No fallback data - just empty array
      setTrendingTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTags();
  }, [daysBack, tagLimit, section, enabled]);

  const refetch = () => {
    fetchTrendingTags();
  };

  return {
    trendingTags,
    loading,
    error,
    refetch
  };
};

export interface SavedPost {
  post_id: string;
  title: string;
  content: string;
  post_type: string;
  section: string;
  saved_at: string;
  post_created_at: string;
}

export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const { data: savedData, error } = await supabase.rpc('get_user_saved_posts', {
        target_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        throw new Error(error.message);
      }

      setSavedPosts(savedData || []);
    } catch (err: any) {
      console.error('Error fetching saved posts:', err);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSavePost = async (postId: string) => {
    try {
      const isCurrentlySaved = savedPosts.some(post => post.post_id === postId);
      
      if (isCurrentlySaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;

        setSavedPosts(prev => prev.filter(post => post.post_id !== postId));
        toast({ title: "Post removed from saved" });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;

        toast({ title: "Post saved" });
        fetchSavedPosts(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error toggling save post:', err);
      toast({
        title: "Error",
        description: "Failed to update saved post",
        variant: "destructive"
      });
    }
  };

  const isPostSaved = (postId: string) => {
    return savedPosts.some(post => post.post_id === postId);
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

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  post_type: string;
  user_tags: string[];
  system_tags: string[];
  helpful_votes: number;
  created_at: string;
  user_id: string;
}

export interface UseTagSearchOptions {
  tags: string[];
  section?: 'field-rep-forum' | 'vendor-bulletin' | null;
  enabled?: boolean;
  limit?: number;
}

export const useTagSearch = (options: UseTagSearchOptions) => {
  const {
    tags,
    section = null,
    enabled = true,
    limit = 50
  } = options;

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchByTags = async () => {
    if (!enabled || tags.length === 0) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_posts_by_tags', {
        search_tags: tags,
        section_filter: section,
        limit_count: limit
      });

      if (error) {
        throw new Error(error.message);
      }

      setSearchResults(data || []);
    } catch (err: any) {
      console.error('Error searching posts by tags:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchByTags();
  }, [tags, section, enabled, limit]);

  return {
    searchResults,
    loading
  };
};

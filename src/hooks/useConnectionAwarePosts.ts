import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionAwarePost {
  id: string;
  title?: string;
  content: string;
  board_type: 'field-rep-forum' | 'vendor-bulletin';
  created_at: string;
  updated_at: string;
  helpful_votes: number;
  flagged: boolean;
  user_id: string;
  author: {
    id: string;
    display_name: string | null;
    role: 'field_rep' | 'vendor' | 'moderator' | 'admin';
    trust_score: number;
    community_score: number;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  acknowledgments_count?: number;
  user_acknowledged?: boolean;
}

interface UseConnectionAwarePostsProps {
  boardType: 'field-rep-forum' | 'vendor-bulletin' | 'all';
  searchKeyword?: string;
  selectedTags?: string[];
  sortBy?: 'newest' | 'helpful' | 'trending' | 'priority';
  limit?: number;
}

interface UseConnectionAwarePostsReturn {
  posts: ConnectionAwarePost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  totalCount: number;
}

export const useConnectionAwarePosts = ({
  boardType,
  searchKeyword = '',
  selectedTags = [],
  sortBy = 'newest',
  limit = 20
}: UseConnectionAwarePostsProps): UseConnectionAwarePostsReturn => {
  const [posts, setPosts] = useState<ConnectionAwarePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user info
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && userData) {
            setCurrentUserRole(userData.role);
          }
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };

    getCurrentUser();
  }, []);

  const fetchPosts = async (resetOffset = false) => {
    if (!currentUserRole || !currentUserId) return;

    try {
      setLoading(true);
      setError(null);

      const currentOffset = resetOffset ? 0 : offset;

      // For vendor bulletin + field rep, we need connection-based filtering
      if (boardType === 'vendor-bulletin' && currentUserRole === 'field_rep') {
        // First get connected vendor IDs
        const { data: connections, error: connectionsError } = await supabase
          .from('contact_unlocks')
          .select('unlocked_user_id, unlocker_id')
          .or(`unlocker_id.eq.${currentUserId},unlocked_user_id.eq.${currentUserId}`);

        if (connectionsError) {
          throw connectionsError;
        }

        const connectedVendorIds = connections
          ?.map(connection => 
            connection.unlocker_id === currentUserId 
              ? connection.unlocked_user_id 
              : connection.unlocker_id
          )
          .filter(id => id !== currentUserId) || [];

        // If no connections, return empty result
        if (connectedVendorIds.length === 0) {
          setPosts([]);
          setTotalCount(0);
          setHasMore(false);
          setLoading(false);
          return;
        }

        // Get vendor bulletin posts from connected vendors only
        let query = supabase
          .from('community_posts')
          .select(`
            id,
            title,
            content,
            board_type,
            created_at,
            updated_at,
            helpful_votes,
            flagged,
            user_id,
            priority,
            author:users!user_id (
              id,
              display_name,
              role,
              trust_score,
              community_score
            )
          `, { count: 'exact' })
          .eq('board_type', 'vendor-bulletin')
          .in('user_id', connectedVendorIds);

        // Apply search
        if (searchKeyword) {
          query = query.or(`title.ilike.%${searchKeyword}%,content.ilike.%${searchKeyword}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'helpful':
            query = query.order('helpful_votes', { ascending: false });
            break;
          case 'priority':
            query = query
              .order('priority', { ascending: false })
              .order('created_at', { ascending: false });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error, count } = await query
          .range(currentOffset, currentOffset + limit - 1);

        if (error) throw error;

        const newPosts = data || [];
        setPosts(resetOffset ? newPosts : [...posts, ...newPosts]);
        setTotalCount(count || 0);
        setHasMore(newPosts.length === limit);
        setOffset(resetOffset ? limit : currentOffset + limit);

      } else {
        // Standard query for field-rep-forum or vendors viewing vendor-bulletin
        let query = supabase
          .from('community_posts')
          .select(`
            id,
            title,
            content,
            board_type,
            created_at,
            updated_at,
            helpful_votes,
            flagged,
            user_id,
            priority,
            author:users!user_id (
              id,
              display_name,
              role,
              trust_score,
              community_score
            )
          `, { count: 'exact' });

        // Board type filtering
        if (boardType !== 'all') {
          query = query.eq('board_type', boardType);
        }

        // Search filtering
        if (searchKeyword) {
          query = query.or(`title.ilike.%${searchKeyword}%,content.ilike.%${searchKeyword}%`);
        }

        // Sorting
        switch (sortBy) {
          case 'helpful':
            query = query.order('helpful_votes', { ascending: false });
            break;
          case 'trending':
            query = query
              .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
              .order('helpful_votes', { ascending: false });
            break;
          case 'priority':
            if (boardType === 'vendor-bulletin') {
              query = query
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });
            } else {
              query = query.order('created_at', { ascending: false });
            }
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error, count } = await query
          .range(currentOffset, currentOffset + limit - 1);

        if (error) throw error;

        const newPosts = data || [];
        setPosts(resetOffset ? newPosts : [...posts, ...newPosts]);
        setTotalCount(count || 0);
        setHasMore(newPosts.length === limit);
        setOffset(resetOffset ? limit : currentOffset + limit);
      }

    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchPosts(false);
    }
  };

  const refetch = async () => {
    setOffset(0);
    await fetchPosts(true);
  };

  // Fetch posts when dependencies change
  useEffect(() => {
    if (currentUserRole && currentUserId) {
      refetch();
    }
  }, [boardType, searchKeyword, selectedTags, sortBy, currentUserRole, currentUserId]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    totalCount
  };
};

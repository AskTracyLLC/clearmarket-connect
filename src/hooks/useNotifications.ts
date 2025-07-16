import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  type: 'review' | 'comment' | 'mention' | 'vote';
  message: string;
  read: boolean;
  created_at: string;
  target_id?: string;
  target_type?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, we'll simulate notifications based on recent activity
      // In a real implementation, you would have a notifications table
      
      // Fetch recent reviews received
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, rating, created_at, reviewer_id')
        .eq('reviewed_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent comments on user's posts
      const { data: userPosts } = await supabase
        .from('community_posts')
        .select('id')
        .eq('user_id', user.id);

      const userPostIds = userPosts?.map(p => p.id) || [];
      
      const { data: comments } = await supabase
        .from('community_comments')
        .select('id, content, created_at, user_id, post_id')
        .in('post_id', userPostIds)
        .neq('user_id', user.id) // Exclude user's own comments
        .order('created_at', { ascending: false })
        .limit(10);

      // Convert to notification format
      const mockNotifications: Notification[] = [];

      reviews?.forEach(review => {
        mockNotifications.push({
          id: `review-${review.id}`,
          type: 'review',
          message: `You received a ${review.rating}-star review`,
          read: false,
          created_at: review.created_at,
          target_id: review.id,
          target_type: 'review'
        });
      });

      comments?.forEach(comment => {
        mockNotifications.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          message: 'Someone commented on your post',
          read: false,
          created_at: comment.created_at,
          target_id: comment.post_id,
          target_type: 'post'
        });
      });

      // Sort by date
      mockNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
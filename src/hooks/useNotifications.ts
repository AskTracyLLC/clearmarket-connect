import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

interface Notification {
  id: string;
  type: 'connection_accepted' | 'connection_rejected' | 'connection_cancelled' | 'review' | 'comment' | 'mention' | 'vote' | 'message';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  target_id?: string;
  target_type?: string;
  metadata?: any;
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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Real-time subscription for new notifications
  useRealtimeSubscription('notifications', (payload) => {
    if (payload.eventType === 'INSERT' && payload.new.user_id === user?.id) {
      setNotifications(prev => [payload.new as Notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } else if (payload.eventType === 'UPDATE' && payload.new.user_id === user?.id) {
      setNotifications(prev =>
        prev.map(n => (n.id === payload.new.id ? payload.new as Notification : n))
      );
      if (payload.old.read === false && payload.new.read === true) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  });

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
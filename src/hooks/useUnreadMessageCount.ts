import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessageCount = () => {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchCount = async () => {
      const { count: unreadCount } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);
      
      setCount(unreadCount || 0);
    };

    fetchCount();

    // Real-time subscription
    const channel = supabase
      .channel('unread_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages'
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
};

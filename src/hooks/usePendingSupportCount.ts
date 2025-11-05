import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePendingSupportCount = () => {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initial fetch - count pending items from both tables
    const fetchCount = async () => {
      const [feedbackResult, worktypeResult] = await Promise.all([
        supabase
          .from('feedback_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('platform_worktype_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
      ]);
      
      const totalCount = (feedbackResult.count || 0) + (worktypeResult.count || 0);
      setCount(totalCount);
    };

    fetchCount();

    // Real-time subscriptions for both tables
    const feedbackChannel = supabase
      .channel('feedback_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback_posts'
        },
        () => fetchCount()
      )
      .subscribe();

    const worktypeChannel = supabase
      .channel('worktype_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_worktype_requests'
        },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(worktypeChannel);
    };
  }, [user]);

  return count;
};

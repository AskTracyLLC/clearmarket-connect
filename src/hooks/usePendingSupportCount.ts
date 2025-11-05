import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePendingSupportCount = () => {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchCount = async () => {
      const { count: pendingCount } = await supabase
        .from('platform_worktype_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      setCount(pendingCount || 0);
    };

    fetchCount();

    // Real-time subscription
    const channel = supabase
      .channel('support_count_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_worktype_requests'
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

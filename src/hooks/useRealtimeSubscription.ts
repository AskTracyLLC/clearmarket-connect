import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table
      }, callback)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, callback]);
};
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  const callbackRef = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table
      }, (payload) => callbackRef.current(payload))
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table]);
};
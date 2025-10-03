import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserCount = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setCount(count || 0);
      } catch (error) {
        console.error('Error fetching user count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return { count, loading };
};

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const [networkConnections, setNetworkConnections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNetworkConnections = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('contact_unlocks')
          .select('unlocked_user_id, unlocker_id')
          .or(`unlocker_id.eq.${user.id},unlocked_user_id.eq.${user.id}`);

        if (error) {
          console.error('Error fetching network connections:', error);
          return;
        }

        // Extract connected user IDs (both unlocked and unlocker relationships)
        const connectedUserIds = data.map(unlock => 
          unlock.unlocker_id === user.id ? unlock.unlocked_user_id : unlock.unlocker_id
        );

        setNetworkConnections(connectedUserIds);
      } catch (error) {
        console.error('Error fetching network connections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkConnections();
  }, [user]);

  const isInNetwork = (fieldRepId: string) => {
    // For development, also check the mock network data
    if (import.meta.env.DEV) {
      // Check mock data by matching userId with repId conversion
      const mockNetworkUserIds = ["mock-user-2"]; // J.D. from mock data
      if (mockNetworkUserIds.includes(fieldRepId)) return true;
    }
    return networkConnections.includes(fieldRepId);
  };

  return {
    networkConnections,
    isInNetwork,
    isLoading,
  };
};
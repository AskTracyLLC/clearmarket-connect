import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface NetworkConnection {
  id: string;
  user_id: string;
  display_name: string | null;
  anonymous_username: string;
  role: 'field_rep' | 'vendor';
  location?: string;
  state?: string;
  city?: string;
  trust_score?: number;
  connection_method: 'unlocked' | 'referral' | 'invitation';
  connected_date: string;
  last_active?: string;
}

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchConnections();
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch accepted connection requests where user is sender or recipient
      const { data: requests, error: reqError } = await supabase
        .from('connection_requests')
        .select('sender_id, recipient_id, created_at, status')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (reqError) throw reqError;

      if (!requests || requests.length === 0) {
        setConnections([]);
        return;
      }

      // Get IDs of connected users
      const connectedUserIds = requests.map(req => 
        req.sender_id === user.id ? req.recipient_id : req.sender_id
      );

      // Fetch user details for all connections
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, anonymous_username, role, last_active')
        .in('id', connectedUserIds);

      if (usersError) throw usersError;

      // Fetch trust scores
      const { data: trustScores } = await supabase
        .from('trust_scores')
        .select('user_id, overall_trust_score')
        .in('user_id', connectedUserIds);

      // Fetch contact unlock methods
      const { data: unlocks } = await supabase
        .from('contact_unlocks')
        .select('unlocker_id, unlocked_user_id, method, created_at')
        .or(`unlocker_id.eq.${user.id},unlocked_user_id.eq.${user.id}`)
        .in('unlocker_id', [...connectedUserIds, user.id])
        .in('unlocked_user_id', [...connectedUserIds, user.id]);

      // Map connections with full details
      const mappedConnections: NetworkConnection[] = users?.map(u => {
        const request = requests.find(r => 
          r.sender_id === u.id || r.recipient_id === u.id
        );
        
        const unlock = unlocks?.find(ul => 
          (ul.unlocker_id === user.id && ul.unlocked_user_id === u.id) ||
          (ul.unlocked_user_id === user.id && ul.unlocker_id === u.id)
        );

        const trust = trustScores?.find(ts => ts.user_id === u.id);
        
        // Map database method to our type
        let connectionMethod: 'unlocked' | 'referral' | 'invitation' = 'invitation';
        if (unlock?.method === 'credit' || unlock?.method === 'purchase') {
          connectionMethod = 'unlocked';
        } else if (unlock?.method === 'referral') {
          connectionMethod = 'referral';
        }

        return {
          id: u.id,
          user_id: u.id,
          display_name: u.display_name,
          anonymous_username: u.anonymous_username,
          role: u.role as 'field_rep' | 'vendor',
          trust_score: trust?.overall_trust_score || undefined,
          connection_method: connectionMethod,
          connected_date: request?.created_at || new Date().toISOString(),
          last_active: u.last_active || undefined,
        };
      }) || [];

      setConnections(mappedConnections);
    } catch (err) {
      console.error('Error fetching network connections:', err);
      setError('Failed to load network connections');
    } finally {
      setIsLoading(false);
    }
  };

  const isInNetwork = (userId: string) => {
    return connections.some(conn => conn.user_id === userId);
  };

  const removeConnection = async (connectionId: string) => {
    if (!user) return false;

    try {
      // Find and delete the connection request
      const { error } = await supabase
        .from('connection_requests')
        .delete()
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${connectionId},recipient_id.eq.${connectionId}`);

      if (error) throw error;

      // Refresh connections
      await fetchConnections();
      return true;
    } catch (err) {
      console.error('Error removing connection:', err);
      return false;
    }
  };

  return {
    connections,
    isLoading,
    error,
    isInNetwork,
    removeConnection,
    refetch: fetchConnections,
  };
};
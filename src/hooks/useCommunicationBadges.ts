import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommunicationBadge {
  id: string;
  badge_type: string;
  display_name: string;
  description: string;
  criteria: any;
  icon_url: string | null;
  badge_color: string;
  is_active: boolean;
  display_order: number;
  earned_at?: string;
}

export const useCommunicationBadges = (userId?: string) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<CommunicationBadge[]>([]);
  const [userBadges, setUserBadges] = useState<CommunicationBadge[]>([]);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchAllBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_badges')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchUserBadges = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_communication_badges')
        .select(`
          earned_at,
          is_active,
          expires_at,
          communication_badges (
            id,
            badge_type,
            display_name,
            description,
            criteria,
            icon_url,
            badge_color,
            is_active,
            display_order
          )
        `)
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      const userBadgesData = data?.map(item => ({
        ...item.communication_badges,
        earned_at: item.earned_at,
        expires_at: item.expires_at
      })) || [];

      setUserBadges(userBadgesData);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBadges = async () => {
    if (!targetUserId) return false;

    try {
      const { error } = await supabase.rpc('update_communication_badges', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Error updating badges:', error);
        return false;
      }

      await fetchUserBadges();
      return true;
    } catch (error) {
      console.error('Error updating badges:', error);
      return false;
    }
  };

  const getBadgeIcon = (badgeType: string): string => {
    const iconMap: Record<string, string> = {
      lightning_fast: '⚡',
      quick_responder: '🚀',
      reliable_communicator: '✅',
      always_available: '🌟',
      consistent_responder: '🎯'
    };
    return iconMap[badgeType] || '🏆';
  };

  useEffect(() => {
    fetchAllBadges();
    fetchUserBadges();
  }, [targetUserId]);

  return {
    badges,
    userBadges,
    loading,
    updateBadges,
    getBadgeIcon,
    refetchBadges: fetchUserBadges
  };
};
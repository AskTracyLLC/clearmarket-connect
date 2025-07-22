import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GiveawayPrize {
  id: string;
  name: string;
  prize_type: 'gift_card' | 'boost_token' | 'bad_day_token' | 'bundle';
  credit_value: number | null;
  description: string;
  cooldown_days: number | null;
  max_active: number;
  is_active: boolean;
}

export const useGiveawayPrizes = () => {
  const [prizes, setPrizes] = useState<GiveawayPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('giveaway_prizes')
        .select('*')
        .eq('is_active', true)
        .order('prize_type', { ascending: true });

      if (error) throw error;
      setPrizes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching giveaway prizes:', err);
      setError('Failed to load prizes');
    } finally {
      setLoading(false);
    }
  };

  const getPrizesByType = (type: string) => {
    return prizes.filter(prize => prize.prize_type === type);
  };

  const getPrizeById = (id: string) => {
    return prizes.find(prize => prize.id === id);
  };

  return {
    prizes,
    loading,
    error,
    refetch: fetchPrizes,
    getPrizesByType,
    getPrizeById
  };
};
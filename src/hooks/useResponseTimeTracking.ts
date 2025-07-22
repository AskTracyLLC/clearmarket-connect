import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ResponseTimeMetrics {
  user_id: string;
  avg_response_minutes: number;
  avg_business_hours_response_minutes: number | null;
  response_rate: number;
  total_messages_received: number;
  total_messages_responded: number;
  fastest_response_minutes: number | null;
  slowest_response_minutes: number | null;
  last_calculated_at: string;
}

export const useResponseTimeTracking = (userId?: string) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ResponseTimeMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchMetrics = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('response_time_tracking')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching response metrics:', error);
        return;
      }

      setMetrics(data);
    } catch (error) {
      console.error('Error fetching response metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = async (periodDays: number = 30) => {
    if (!targetUserId) return false;

    try {
      const { error } = await supabase.rpc('calculate_response_metrics', {
        target_user_id: targetUserId,
        period_days: periodDays
      });

      if (error) {
        console.error('Error calculating metrics:', error);
        return false;
      }

      await fetchMetrics();
      return true;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return false;
    }
  };

  const formatResponseTime = (minutes: number | null): string => {
    if (!minutes || minutes === 0) return 'No data yet';
    
    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      if (remainingMins === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
      }
      return `${hours}h ${remainingMins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      if (remainingHours === 0) {
        return `${days} day${days === 1 ? '' : 's'}`;
      }
      return `${days}d ${remainingHours}h`;
    }
  };

  const getResponseTimeMessage = (minutes: number | null): string => {
    if (!minutes || minutes === 0) return 'Response time not available';
    
    const timeStr = formatResponseTime(minutes);
    return `Typically replies within ${timeStr}`;
  };

  useEffect(() => {
    fetchMetrics();
  }, [targetUserId]);

  return {
    metrics,
    loading,
    calculateMetrics,
    formatResponseTime,
    getResponseTimeMessage,
    refetch: fetchMetrics
  };
};
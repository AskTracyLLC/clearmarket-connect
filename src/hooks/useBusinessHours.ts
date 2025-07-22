import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BusinessHour {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

export const useBusinessHours = (userId?: string) => {
  const { user } = useAuth();
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchBusinessHours = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_business_hours')
        .select('*')
        .eq('user_id', targetUserId)
        .order('day_of_week');

      if (error) throw error;
      setBusinessHours(data || []);
    } catch (error) {
      console.error('Error fetching business hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHour = async (
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    isActive: boolean = true,
    timezone: string = 'America/Chicago'
  ) => {
    if (!targetUserId) return false;

    try {
      const { error } = await supabase
        .from('user_business_hours')
        .upsert({
          user_id: targetUserId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          timezone,
          is_active: isActive
        }, {
          onConflict: 'user_id,day_of_week'
        });

      if (error) throw error;
      await fetchBusinessHours();
      return true;
    } catch (error) {
      console.error('Error updating business hour:', error);
      return false;
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || '';
  };

  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const isWithinBusinessHours = (date: Date = new Date()): boolean => {
    const dayOfWeek = date.getDay();
    const currentTime = date.toTimeString().slice(0, 5); // HH:mm format
    
    const dayHours = businessHours.find(bh => 
      bh.day_of_week === dayOfWeek && bh.is_active
    );
    
    if (!dayHours) return false;
    
    return currentTime >= dayHours.start_time && currentTime <= dayHours.end_time;
  };

  const getBusinessHoursSummary = (): string => {
    const activeDays = businessHours.filter(bh => bh.is_active);
    if (activeDays.length === 0) return 'No business hours set';
    
    // Group consecutive days with same hours
    const groupedHours = activeDays.reduce((acc, hour) => {
      const timeKey = `${hour.start_time}-${hour.end_time}`;
      if (!acc[timeKey]) acc[timeKey] = [];
      acc[timeKey].push(hour.day_of_week);
      return acc;
    }, {} as Record<string, number[]>);

    const summaries = Object.entries(groupedHours).map(([timeRange, days]) => {
      const [start, end] = timeRange.split('-');
      const sortedDays = days.sort((a, b) => a - b);
      
      // Format consecutive days
      let dayStr = '';
      if (sortedDays.length === 5 && sortedDays.join(',') === '1,2,3,4,5') {
        dayStr = 'Mon-Fri';
      } else if (sortedDays.length === 7) {
        dayStr = 'Every day';
      } else {
        dayStr = sortedDays.map(d => getDayName(d).slice(0, 3)).join(', ');
      }
      
      return `${dayStr}: ${formatTime(start)} - ${formatTime(end)}`;
    });

    return summaries.join(' | ');
  };

  useEffect(() => {
    fetchBusinessHours();
  }, [targetUserId]);

  return {
    businessHours,
    loading,
    updateBusinessHour,
    getDayName,
    formatTime,
    isWithinBusinessHours,
    getBusinessHoursSummary,
    refetch: fetchBusinessHours
  };
};
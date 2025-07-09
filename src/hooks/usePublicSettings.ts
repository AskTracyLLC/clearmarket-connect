import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSetting {
  setting_key: string;
  setting_value: any;
  setting_type: string;
}

export const usePublicSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('setting_key, setting_value, setting_type')
          .eq('is_public', true);

        if (error) {
          console.error('Error fetching public settings:', error);
          return;
        }

        const settingsMap: Record<string, any> = {};
        data?.forEach((setting: SystemSetting) => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });

        setSettings(settingsMap);
      } catch (error) {
        console.error('Error fetching public settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicSettings();
  }, []);

  return { settings, loading };
};
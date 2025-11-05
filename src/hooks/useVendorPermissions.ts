import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useVendorPermissions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsStaff(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is vendor staff member
        const { data: staffData, error } = await supabase
          .from('vendor_staff_members')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking vendor permissions:', error);
          setIsAdmin(false);
          setIsStaff(false);
        } else if (staffData) {
          setIsAdmin(staffData.role === 'admin');
          setIsStaff(true);
        } else {
          setIsAdmin(false);
          setIsStaff(false);
        }
      } catch (error) {
        console.error('Error in checkPermissions:', error);
        setIsAdmin(false);
        setIsStaff(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [user]);

  return {
    isAdmin,
    isStaff,
    canEdit: isAdmin,
    canView: isStaff,
    loading,
  };
};

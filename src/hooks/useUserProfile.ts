import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  id: string;
  display_name: string | null;
  anonymous_username: string;
  role: 'field_rep' | 'vendor' | 'moderator' | 'admin';
  trust_score: number | null;
  profile_complete: number | null;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, anonymous_username, role, trust_score, profile_complete')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    
    try {
      // SECURITY: Remove role from updates to prevent privilege escalation
      // Only admins can change roles via admin_update_user_role() function
      const { role, ...safeUpdates } = updates;
      
      if (Object.keys(safeUpdates).length === 0) {
        console.warn('No valid fields to update');
        return false;
      }
      
      const { error } = await supabase
        .from('users')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...safeUpdates } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};
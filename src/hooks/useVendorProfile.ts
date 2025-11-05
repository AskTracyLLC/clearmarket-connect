import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VendorProfile {
  user_id?: string;
  company_name?: string;
  company_abbreviation?: string;
  phone?: string;
  email?: string;
  website?: string;
  company_bio?: string;
  platforms?: string[];
  other_platform?: string;
  work_types?: string[];
  avg_jobs_per_month?: string;
  payment_terms?: string;
  created_at?: string;
  updated_at?: string;
}

export const useVendorProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveProfile = useCallback(async (profileData: Partial<VendorProfile>): Promise<{ success: boolean }> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        const { error: updateError } = await supabase
          .from("vendor_profiles")
          .update({ ...profileData, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("vendor_profiles")
          .insert({
            user_id: user.id,
            ...profileData,
          });
        
        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchProfile = useCallback(async (): Promise<VendorProfile | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    saveProfile,
    fetchProfile,
    loading,
  };
};

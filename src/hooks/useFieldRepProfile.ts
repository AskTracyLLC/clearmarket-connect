import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FieldRepProfile } from "@/components/FieldRepProfile/types";

export const useFieldRepProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveProfile = async (profileData: Partial<FieldRepProfile>) => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      // Map form data to database columns
      const dbData = {
        user_id: user.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        bio: profileData.bio,
        aspen_grove_id: profileData.aspen_grove_id,
        aspen_grove_expiration: profileData.aspen_grove_expiration?.toISOString().split('T')[0],
        aspen_grove_image: profileData.aspen_grove_image,
        platforms: profileData.platforms,
        other_platform: profileData.other_platform,
        inspection_types: profileData.inspection_types,
        hud_keys: profileData.hud_keys,
        other_hud_key: profileData.other_hud_key,
        interested_in_beta: profileData.interested_in_beta || false,
        profile_complete_percentage: calculateCompleteness(profileData)
      };

      const { data, error } = await supabase
        .from('field_rep_profiles')
        .upsert(dbData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving field rep profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('field_rep_full_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching field rep profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = (profile: Partial<FieldRepProfile>): number => {
    const requiredFields = [
      'first_name', 'last_name', 'phone', 'city', 'state', 'zip_code', 'bio'
    ];
    const optionalButValuableFields = [
      'platforms', 'inspection_types', 'aspen_grove_id'
    ];
    
    let score = 0;
    let totalFields = requiredFields.length + optionalButValuableFields.length;
    
    // Required fields worth more
    requiredFields.forEach(field => {
      if (profile[field as keyof FieldRepProfile]) score += 2;
    });
    
    // Optional fields worth less but still valuable
    optionalButValuableFields.forEach(field => {
      const value = profile[field as keyof FieldRepProfile];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) score += 1;
    });
    
    return Math.min(Math.round((score / (requiredFields.length * 2 + optionalButValuableFields.length)) * 100), 100);
  };

  return {
    saveProfile,
    fetchProfile,
    loading
  };
};
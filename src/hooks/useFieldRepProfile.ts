import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { FieldRepProfile as FieldRepDbProfile } from "@/components/FieldRepProfile/types";

const toDbDate = (d?: Date | string) => {
  if (!d) return undefined;
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

const mapToDb = (p: Partial<FieldRepDbProfile>) => {
  const { aspen_grove_expiration, hasAspenGrove, hasHudKeys, ...rest } = p;
  return {
    ...rest,
    ...(aspen_grove_expiration !== undefined
      ? { aspen_grove_expiration: toDbDate(aspen_grove_expiration) }
      : {}),
    ...(hasAspenGrove !== undefined
      ? { has_aspen_grove: hasAspenGrove }
      : {}),
    ...(hasHudKeys !== undefined
      ? { has_hud_keys: hasHudKeys }
      : {}),
  } as Record<string, unknown>;
};

const mapFromDb = (p: any): FieldRepDbProfile => ({
  ...p,
  aspen_grove_expiration: p?.aspen_grove_expiration
    ? new Date(p.aspen_grove_expiration as string)
    : undefined,
  hasAspenGrove: p?.has_aspen_grove,
  hasHudKeys: p?.has_hud_keys,
});

export const useFieldRepProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveProfile = async (profileData: Partial<FieldRepDbProfile>): Promise<{ success: boolean }> => {
    console.log('🔵 useFieldRepProfile.saveProfile called');
    if (!user) {
      console.error('❌ No user found');
      throw new Error("User not authenticated");
    }

    console.log('📝 Saving profile for user:', user.id);
    console.log('📦 Profile data:', profileData);

    setLoading(true);
    try {
      // Check if profile exists
      console.log('🔍 Checking if profile exists...');
      const { data: existing, error: fetchError } = await supabase
        .from("field_rep_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching existing profile:', fetchError);
        throw fetchError;
      }

      console.log('📊 Existing profile:', existing ? 'Found' : 'Not found');

      const toDb = mapToDb(profileData);
      console.log('🔄 Mapped data for DB:', toDb);

      if (existing) {
        console.log('📝 Updating existing profile...');
        const { error: updateError } = await supabase
          .from("field_rep_profiles")
          .update({ ...toDb, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        
        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw updateError;
        }
        console.log('✅ Profile updated successfully');
      } else {
        console.log('📝 Inserting new profile...');
        const insertPayload = {
          user_id: user.id,
          ...toDb,
        };
        console.log('📦 Insert payload:', insertPayload);
        
        const { error: insertError } = await supabase
          .from("field_rep_profiles")
          .insert(insertPayload);
        
        if (insertError) {
          console.error('❌ Insert error:', insertError);
          throw insertError;
        }
        console.log('✅ Profile inserted successfully');
      }

      // Recalculate and persist profile completeness (non-blocking)
      try {
        console.log('📊 Updating profile completeness...');
        const { data: fullProfile, error: fullErr } = await supabase
          .from("field_rep_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!fullErr && fullProfile) {
          const completion = calculateCompleteness(mapFromDb(fullProfile));
          console.log('📈 Calculated completion:', completion);
          
          const { error: updErr } = await supabase
            .from("users")
            .update({ profile_complete: completion })
            .eq("id", user.id);
          
          if (updErr) {
            console.warn('⚠️ Could not update profile_complete (non-critical):', updErr);
          } else {
            console.log('✅ Profile completeness updated');
          }
        }
      } catch (err) {
        console.warn('⚠️ Profile completeness update failed (non-critical):', err);
      }

      console.log('✅ Save profile completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Save profile failed:', error);
      // Let caller handle user-friendly messaging
      throw error;
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const fetchProfile = async (): Promise<FieldRepDbProfile | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("field_rep_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapFromDb(data) : null;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = (profile: FieldRepDbProfile): number => {
    const requiredFields: (keyof FieldRepDbProfile)[] = [
      "first_name",
      "last_name",
      "city",
      "state",
      "zip_code",
      "bio",
    ];
    const optionalButValuableFields: (keyof FieldRepDbProfile)[] = [
      "platforms",
      "inspection_types",
      "aspen_grove_id",
    ];

    let score = 0;

    requiredFields.forEach((field) => {
      const value = profile[field];
      if (typeof value === "string" && value.trim().length > 0) score += 2;
    });

    optionalButValuableFields.forEach((field) => {
      const value = profile[field];
      if (Array.isArray(value)) {
        if (value.length > 0) score += 1;
      } else if (typeof value === "string") {
        if (value.trim().length > 0) score += 1;
      }
    });

    return Math.min(
      Math.round((score / (requiredFields.length * 2 + optionalButValuableFields.length)) * 100),
      100
    );
  };

  return {
    saveProfile,
    fetchProfile,
    loading,
  };
};

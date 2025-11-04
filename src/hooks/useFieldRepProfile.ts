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
    if (!user) throw new Error("User not authenticated");

    setLoading(true);
    try {
      // Check if profile exists
      const { data: existing, error: fetchError } = await supabase
        .from("field_rep_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const toDb = mapToDb(profileData);

      if (existing) {
        const { error: updateError } = await supabase
          .from("field_rep_profiles")
          .update({ ...toDb, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (updateError) throw updateError;
      } else {
        const insertPayload = {
          user_id: user.id,
          ...toDb,
        };
        const { error: insertError } = await supabase
          .from("field_rep_profiles")
          .insert(insertPayload);
        if (insertError) throw insertError;
      }

      // Recalculate and persist profile completeness (non-blocking)
      try {
        const { data: fullProfile, error: fullErr } = await supabase
          .from("field_rep_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!fullErr && fullProfile) {
          const completion = calculateCompleteness(mapFromDb(fullProfile));
          const { error: updErr } = await supabase
            .from("users")
            .update({ profile_complete: completion })
            .eq("id", user.id);
          // Swallow RLS or network errors here to avoid blocking the main save
          if (updErr) {
            // noop - profile saved successfully; completion can be recalculated later
          }
        }
      } catch (_) {
        // noop - do not block save on completeness update failures
      }

      return { success: true };
    } catch (error) {
      // Let caller handle user-friendly messaging
      throw error;
    } finally {
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

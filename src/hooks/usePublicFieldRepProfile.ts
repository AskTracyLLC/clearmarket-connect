import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicFieldRepProfile {
  id: string;
  anonymousUsername: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  platforms: string[] | null;
  inspectionTypes: string[] | null;
  hudKeys: string[] | null;
  hasAspenGrove: boolean | null;
  hasHudKeys: boolean | null;
  aspenGroveId: string | null;
  aspenGroveExpiration: Date | null;
  trustScore: number | null;
  totalReviews: number;
  averageRating: number | null;
  createdAt: Date;
  coverageAreas: Array<{
    state: string;
    counties: string[];
    isAllCounties: boolean;
  }>;
}

export const usePublicFieldRepProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<PublicFieldRepProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch user basic info
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("anonymous_username, display_name, trust_score, created_at, role")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        if (!userData) throw new Error("User not found");
        if (userData.role !== "field_rep") throw new Error("User is not a field representative");

        // Fetch field rep profile
        const { data: profileData, error: profileError } = await supabase
          .from("field_rep_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

        // Fetch coverage areas
        const { data: coverageData, error: coverageError } = await supabase
          .from("coverage_areas")
          .select("state_name, state_code, counties, is_all_counties")
          .eq("user_id", userId);

        if (coverageError) throw coverageError;

        // Fetch trust score details
        const { data: trustScoreData } = await supabase
          .from("trust_scores")
          .select("overall_trust_score, total_reviews")
          .eq("user_id", userId)
          .maybeSingle();

        // Map the data
        const mappedProfile: PublicFieldRepProfile = {
          id: userId,
          anonymousUsername: userData.anonymous_username,
          displayName: userData.display_name,
          firstName: profileData?.first_name || null,
          lastName: profileData?.last_name || null,
          city: profileData?.city || null,
          state: profileData?.state || null,
          zipCode: profileData?.zip_code || null,
          bio: profileData?.bio || null,
          phone: profileData?.phone || null,
          email: null, // Email not publicly visible
          platforms: profileData?.platforms || null,
          inspectionTypes: profileData?.inspection_types || null,
          hudKeys: profileData?.hud_keys || null,
          hasAspenGrove: !!profileData?.aspen_grove_id,
          hasHudKeys: !!(profileData?.hud_keys && profileData.hud_keys.length > 0),
          aspenGroveId: profileData?.aspen_grove_id || null,
          aspenGroveExpiration: profileData?.aspen_grove_expiration 
            ? new Date(profileData.aspen_grove_expiration) 
            : null,
          trustScore: trustScoreData?.overall_trust_score || userData.trust_score || 50,
          totalReviews: trustScoreData?.total_reviews || 0,
          averageRating: null, // Can be calculated from reviews if needed
          createdAt: new Date(userData.created_at),
          coverageAreas: (coverageData || []).map((area) => ({
            state: area.state_name,
            counties: area.counties || [],
            isAllCounties: area.is_all_counties || false,
          })),
        };

        setProfile(mappedProfile);
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  return { profile, loading, error };
};

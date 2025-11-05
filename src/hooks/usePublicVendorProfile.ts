import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicVendorProfile {
  userId: string;
  displayName: string;
  anonymousUsername: string;
  companyName?: string;
  companyAbbreviation?: string;
  companyBio?: string;
  phone?: string;
  email?: string;
  website?: string;
  platforms?: string[];
  otherPlatform?: string;
  workTypes?: string[];
  avgJobsPerMonth?: string;
  paymentTerms?: string;
  coverageAreas?: Array<{
    state: string;
    stateCode: string;
    counties: string[];
    isAllCounties: boolean;
  }>;
  trustScore?: {
    overall_score: number;
    badge_level: string;
    total_reviews: number;
    communication_score: number;
    payment_speed_score: number;
    support_quality_score: number;
  };
  verifications?: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  joinedDate?: string;
}

export const usePublicVendorProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<PublicVendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("display_name, anonymous_username, email, created_at")
          .eq("id", userId)
          .single();

        if (userError) throw userError;

        // Fetch vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from("vendor_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (vendorError) throw vendorError;

        // Fetch coverage areas
        const { data: coverageData, error: coverageError } = await supabase
          .from("coverage_areas")
          .select("state_name, state_code, counties, is_all_counties")
          .eq("user_id", userId);

        if (coverageError) throw coverageError;

        // Fetch trust score
        const { data: trustScoreData, error: trustScoreError } = await supabase
          .from("trust_scores")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (trustScoreError && trustScoreError.code !== 'PGRST116') {
          console.error("Trust score fetch error:", trustScoreError);
        }

        // Map coverage areas
        const coverageAreas = coverageData?.map(area => ({
          state: area.state_name,
          stateCode: area.state_code,
          counties: area.counties || [],
          isAllCounties: area.is_all_counties || false,
        })) || [];

        setProfile({
          userId,
          displayName: userData.display_name || "",
          anonymousUsername: userData.anonymous_username || "",
          companyName: vendorData?.company_name,
          companyAbbreviation: vendorData?.company_abbreviation,
          companyBio: vendorData?.company_bio,
          phone: vendorData?.phone,
          email: vendorData?.email || userData.email,
          website: vendorData?.website,
          platforms: vendorData?.platforms || [],
          otherPlatform: vendorData?.other_platform,
          workTypes: vendorData?.work_types || [],
          avgJobsPerMonth: vendorData?.avg_jobs_per_month,
          paymentTerms: vendorData?.payment_terms,
          coverageAreas,
          trustScore: trustScoreData ? {
            overall_score: trustScoreData.overall_trust_score,
            badge_level: trustScoreData.badge_level,
            total_reviews: 0, // Count from separate reviews query if needed
            communication_score: trustScoreData.communication_score,
            payment_speed_score: trustScoreData.paid_on_time_score,
            support_quality_score: trustScoreData.quality_of_work_score || 0,
          } : undefined,
          verifications: {
            emailVerified: !!userData.email,
            phoneVerified: !!vendorData?.phone,
          },
          joinedDate: userData.created_at,
        });
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
};

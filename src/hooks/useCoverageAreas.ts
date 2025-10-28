import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CoverageArea } from "@/components/FieldRepProfile/types";

export const useCoverageAreas = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveCoverageAreas = async (
    coverageAreas: CoverageArea[]
  ): Promise<{ success: boolean; stats?: { inserted: number; updated: number; deleted: number } }> => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      // Get user's anonymous_username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("anonymous_username")
        .eq("id", user.id)
        .single();
      
      if (userError || !userData?.anonymous_username) {
        throw new Error("Could not retrieve user information");
      }

      // Transform coverage areas to match RPC payload format
      const payload = coverageAreas.map(area => ({
        state_code: area.stateCode,
        state_name: area.state,
        is_all_counties: area.counties.length === 1 && area.counties[0] === "All Counties",
        counties: area.counties,
        standard_price: area.standardPrice || null,
        rush_price: area.rushPrice || null,
        inspection_types: area.inspectionTypes.map(it => ({
          id: it.id,
          inspection_type: it.inspectionType,
          price: it.price
        }))
      }));

      // Call the efficient diff-based RPC
      const { data, error } = await supabase.rpc("sync_coverage_areas_v2", {
        p_username: userData.anonymous_username,
        p_payload: payload
      });

      if (error) throw error;

      return { 
        success: true, 
        stats: data?.[0] || { inserted: 0, updated: 0, deleted: 0 }
      };
    } catch (error) {
      console.error("Error saving coverage areas:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCoverageAreas = async (): Promise<CoverageArea[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coverage_areas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(dbArea => ({
        id: dbArea.id,
        state: dbArea.state_name,
        stateCode: dbArea.state_code,
        counties: dbArea.counties,
        standardPrice: dbArea.standard_price,
        rushPrice: dbArea.rush_price,
        inspectionTypes: (dbArea.inspection_types as any[])?.map((it: any) => ({
          id: it.id,
          inspectionType: it.inspection_type,
          price: it.price
        })) || []
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveCoverageAreas,
    fetchCoverageAreas,
    loading,
  };
};
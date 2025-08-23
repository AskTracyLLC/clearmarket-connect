import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CoverageArea, InspectionTypePricing } from "@/components/FieldRepProfile/types";

export const useCoverageAreas = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveCoverageAreas = async (coverageAreas: CoverageArea[]): Promise<{ success: boolean }> => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      // Delete existing coverage areas first
      await supabase
        .from("coverage_areas")
        .delete()
        .eq("user_id", user.id);
      
      // Insert new coverage areas
      if (coverageAreas.length > 0) {
        const dbCoverageAreas = coverageAreas.map(area => ({
          user_id: user.id,
          state_name: area.state,
          state_code: area.stateCode,
          counties: area.counties,
          is_all_counties: area.counties.length === 1 && area.counties[0] === "All Counties",
          standard_price: area.standardPrice,
          rush_price: area.rushPrice,
          inspection_types: area.inspectionTypes.map(it => ({
            id: it.id,
            inspection_type: it.inspectionType,
            price: it.price
          }))
        }));
        
        const { error: insertError } = await supabase
          .from("coverage_areas")
          .insert(dbCoverageAreas);
          
        if (insertError) throw insertError;
      }
      
      return { success: true };
    } catch (error) {
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export const useWorkTypes = () => {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("work_types")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setWorkTypes(data || []);
    } catch (err) {
      console.error("Error fetching work types:", err);
      setError(err instanceof Error ? err.message : "Failed to load work types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  const getWorkTypeNames = (): string[] => {
    return workTypes.map(wt => wt.name);
  };

  const refetch = () => {
    fetchWorkTypes();
  };

  return {
    workTypes,
    loading,
    error,
    getWorkTypeNames,
    refetch
  };
};
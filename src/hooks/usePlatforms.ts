import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Platform {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

export const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("platforms")
        .select("id, name, description, category, is_active, display_order")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      
      setPlatforms(data || []);
    } catch (err) {
      console.error("Error fetching platforms:", err);
      setError("Failed to load platforms");
    } finally {
      setLoading(false);
    }
  };

  // Return platform names as array for backward compatibility
  const getPlatformNames = (): string[] => {
    return platforms.map(platform => platform.name);
  };

  // Get platforms by category
  const getPlatformsByCategory = (category: string): Platform[] => {
    return platforms.filter(platform => platform.category === category);
  };

  // Get platforms filtered by work types
  const getPlatformsByWorkTypes = async (workTypeNames: string[]): Promise<Platform[]> => {
    if (workTypeNames.length === 0) return platforms;

    try {
      const { data, error } = await supabase
        .from("platform_work_type_mappings")
        .select(`
          platform_id,
          platforms!inner(id, name, description, category, is_active, display_order),
          work_types!inner(name)
        `)
        .in("work_types.name", workTypeNames)
        .eq("is_active", true)
        .eq("platforms.is_active", true);

      if (error) throw error;

      // Remove duplicates and return unique platforms
      const uniquePlatforms = Array.from(
        new Map(
          data.map(item => [item.platforms.id, item.platforms])
        ).values()
      ) as Platform[];

      return uniquePlatforms.sort((a, b) => a.display_order - b.display_order);
    } catch (error) {
      console.error("Error fetching platforms by work types:", error);
      return platforms;
    }
  };

  return {
    platforms,
    loading,
    error,
    refetch: fetchPlatforms,
    getPlatformNames,
    getPlatformsByCategory,
    getPlatformsByWorkTypes,
  };
};
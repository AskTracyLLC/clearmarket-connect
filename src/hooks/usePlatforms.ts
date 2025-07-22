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
        .order("display_order", { ascending: true });

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

  return {
    platforms,
    loading,
    error,
    refetch: fetchPlatforms,
    getPlatformNames,
    getPlatformsByCategory,
  };
};
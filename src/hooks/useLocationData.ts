import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface State {
  id: string;
  name: string;
  code: string;
  counties?: County[];
}

export interface County {
  id: string;
  name: string;
  state_id: string;
}

export interface ZipCode {
  id: string;
  zip_code: string;
  county_id: string;
  state_id: string;
  rural_urban_designation: "Rural" | "Urban";
  county?: { id: string; name: string };
  state?: { id: string; name: string; code: string };
}

export const useStates = () => {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from("states")
          .select("*")
          .order("name");

        if (error) throw error;
        setStates(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch states");
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  return { states, loading, error };
};

export const useCountiesByState = (stateCode?: string) => {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateCode) {
      setCounties([]);
      return;
    }

    const fetchCounties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("counties")
          .select(`
            *,
            state:states!counties_state_id_fkey(code)
          `)
          .eq("state.code", stateCode)
          .order("name");

        if (error) throw error;
        
        // Deduplicate counties by name (prioritize shorter names without "County" suffix)
        const deduplicatedCounties = (data || []).reduce((acc, county) => {
          const baseName = county.name.replace(/\s+County$/i, '');
          const existing = acc.find(c => 
            c.name.replace(/\s+County$/i, '') === baseName
          );
          
          if (!existing) {
            acc.push(county);
          } else {
            // Replace with shorter name (prefer without "County" suffix)
            if (county.name.length < existing.name.length) {
              const index = acc.indexOf(existing);
              acc[index] = county;
            }
          }
          
          return acc;
        }, [] as typeof data);
        
        setCounties(deduplicatedCounties);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch counties");
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
  }, [stateCode]);

  return { counties, loading, error };
};

export const useZipCodes = (filters?: {
  stateCode?: string;
  countyId?: string;
  ruralUrban?: "Rural" | "Urban";
}) => {
  const [zipCodes, setZipCodes] = useState<ZipCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZipCodes = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("zip_codes")
          .select(`
            *,
            county:counties!zip_codes_county_id_fkey(id, name),
            state:states!zip_codes_state_id_fkey(id, name, code)
          `)
          .order("zip_code");

        if (filters?.stateCode) {
          query = query.eq("state.code", filters.stateCode);
        }
        if (filters?.countyId) {
          query = query.eq("county_id", filters.countyId);
        }
        if (filters?.ruralUrban) {
          query = query.eq("rural_urban_designation", filters.ruralUrban);
        }

        const { data, error } = await query;

        if (error) throw error;
        setZipCodes((data || []).map(item => ({
          ...item,
          rural_urban_designation: item.rural_urban_designation as "Rural" | "Urban"
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ZIP codes");
      } finally {
        setLoading(false);
      }
    };

    fetchZipCodes();
  }, [filters?.stateCode, filters?.countyId, filters?.ruralUrban]);

  return { zipCodes, loading, error };
};

export const useLocationByZip = (zipCode?: string) => {
  const [location, setLocation] = useState<ZipCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!zipCode) {
      setLocation(null);
      return;
    }

    const fetchLocation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("zip_codes")
          .select(`
            *,
            county:counties!zip_codes_county_id_fkey(id, name),
            state:states!zip_codes_state_id_fkey(id, name, code)
          `)
          .eq("zip_code", zipCode)
          .maybeSingle();

        if (error) throw error;
        setLocation(data ? {
          ...data,
          rural_urban_designation: data.rural_urban_designation as "Rural" | "Urban"
        } : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch location");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [zipCode]);

  return { location, loading, error };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StateData {
  name: string;
  repCount: number;
}

interface CoverageSummary {
  states_with_coverage: number;
  total_counties: number;
  total_field_reps: number;
  states_needing_coverage: number;
}

export const useRealCoverageData = (vendorId?: string) => {
  const [statesWithCoverage, setStatesWithCoverage] = useState<Record<string, StateData>>({});
  const [coverageSummary, setCoverageSummary] = useState<CoverageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverageData();
  }, [vendorId]);

  const fetchCoverageData = async () => {
    try {
      setLoading(true);
      
      // For now, let's simulate coverage for your existing 5 states
      const mockCoverageStates = {
        'CA': { name: 'California', repCount: 5 },
        'TX': { name: 'Texas', repCount: 3 },
        'FL': { name: 'Florida', repCount: 2 },
        'NY': { name: 'New York', repCount: 4 },
        'IL': { name: 'Illinois', repCount: 1 }
      };

      setStatesWithCoverage(mockCoverageStates);
      setCoverageSummary({
        states_with_coverage: 5,
        total_counties: 15,
        total_field_reps: 15,
        states_needing_coverage: 45
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    statesWithCoverage,
    coverageSummary,
    loading,
    error,
    refetch: fetchCoverageData
  };
};
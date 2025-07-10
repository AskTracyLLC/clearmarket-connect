import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealCoverageData = (vendorId) => {
  const [statesWithCoverage, setStatesWithCoverage] = useState({});
  const [coverageSummary, setCoverageSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoverageData();
  }, [vendorId]);

  const fetchCoverageData = async () => {
    try {
      setLoading(true);
      
      // For now, let's simulate coverage for your existing 5 states
      // You can replace this with real coverage data later
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

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStateCounties = async (stateCode) => {
    try {
      // Fetch real counties for any state from your database
      const { data, error } = await supabase
        .from('counties')
        .select(`
          id,
          name,
          states(code, name)
        `)
        .eq('states.code', stateCode);

      if (error) throw error;

      // Transform to match your current component structure
      const countiesData = {};
      data.forEach(county => {
        countiesData[county.name] = {
          reps: Math.floor(Math.random() * 3), // Random for now
          active: Math.random() > 0.6, // 40% chance of active coverage
          requested: Math.random() > 0.8 // 20% chance of requested
        };
      });

      return countiesData;
    } catch (err) {
      console.error('Error fetching counties:', err);
      return {};
    }
  };

  return {
    statesWithCoverage,
    coverageSummary,
    loading,
    error,
    fetchStateCounties,
    refetch: fetchCoverageData
  };
};
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const DatabaseStateCountyMap = ({ stateCode, onCountyClick }) => {
  const [counties, setCounties] = useState([]);
  const [countyData, setCountyData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountiesForState();
  }, [stateCode]);

  const fetchCountiesForState = async () => {
    try {
      setLoading(true);
      
      // Fetch real counties from your database
      const { data, error } = await supabase
        .from('counties')
        .select(`
          id,
          name,
          states!inner(code, name)
        `)
        .eq('states.code', stateCode);

      if (error) throw error;

      const countyNames = data.map(county => county.name);
      setCounties(countyNames);

      // Generate mock coverage data for each county
      const mockData = {};
      data.forEach(county => {
        mockData[county.name] = {
          reps: Math.floor(Math.random() * 3),
          active: Math.random() > 0.6,
          requested: Math.random() > 0.8
        };
      });
      setCountyData(mockData);

    } catch (err) {
      console.error('Error fetching counties:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCountyFill = (countyName) => {
    const county = countyData[countyName];
    if (!county) return '#e5e7eb';
    if (county.active) return '#10b981';
    if (county.requested) return '#f59e0b';
    return '#d1d5db';
  };

  if (loading) {
    return <Skeleton className="w-full h-96" />;
  }

  // For states with detailed SVG maps, use your existing ones
  if (['CA', 'TX', 'FL', 'NY', 'IL'].includes(stateCode)) {
    // Import your existing StateCountyMap component here
    // return <YourExistingStateCountyMap stateCode={stateCode} counties={countyData} onCountyClick={onCountyClick} />;
  }

  // For all other states, create a simple grid layout with real county names
  const gridCols = Math.ceil(Math.sqrt(counties.length));
  const gridRows = Math.ceil(counties.length / gridCols);

  return (
    <div className="bg-muted/10 border border-muted rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4 text-center">
        {stateCode} Counties ({counties.length} total)
      </h4>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Active Coverage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Coverage Requested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm">No Coverage</span>
        </div>
      </div>

      {/* Counties Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
        {counties.map((countyName) => (
          <div
            key={countyName}
            className={`p-2 rounded border text-center cursor-pointer hover:opacity-80 transition-opacity`}
            style={{ backgroundColor: getCountyFill(countyName) }}
            onClick={() => onCountyClick?.(countyName)}
          >
            <div className="text-xs font-semibold text-white">
              {countyName.length > 10 ? countyName.substring(0, 10) + '...' : countyName}
            </div>
            {countyData[countyName]?.active && (
              <div className="text-xs text-white">
                {countyData[countyName].reps} rep{countyData[countyName].reps !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        Click on counties for detailed information
      </p>
    </div>
  );
};

export default DatabaseStateCountyMap;
import React, { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseStateCountyMap = ({ stateCode, onCountyClick }) => {
  const [counties, setCounties] = useState([]);
  const [countyData, setCountyData] = useState({});
  const [zipCodes, setZipCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countySearch, setCountySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [zipSearch, setZipSearch] = useState('');

  useEffect(() => {
    fetchCountiesAndZipCodes();
  }, [stateCode]);

  const fetchCountiesAndZipCodes = async () => {
    try {
      setLoading(true);
      
      // Fetch counties
      const { data: countiesData, error: countiesError } = await supabase
        .from('counties')
        .select(`
          id,
          name,
          states!inner(code, name)
        `)
        .eq('states.code', stateCode);

      if (countiesError) throw countiesError;

      const countyNames = countiesData.map(county => county.name);
      setCounties(countyNames);

      // Fetch zip codes with city and county information
      const { data: zipData, error: zipError } = await supabase
        .from('zip_codes')
        .select(`
          zip_code,
          city,
          counties!inner(name, states!inner(code))
        `)
        .eq('counties.states.code', stateCode);

      if (zipError) throw zipError;

      setZipCodes(zipData || []);

      // Generate mock coverage data for each county
      const mockData = {};
      countiesData.forEach(county => {
        mockData[county.name] = {
          reps: Math.floor(Math.random() * 3),
          active: Math.random() > 0.6,
          requested: Math.random() > 0.8
        };
      });
      setCountyData(mockData);

    } catch (err) {
      console.error('Error fetching data:', err);
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

  const getCountyDisplayName = (countyName) => {
    // Remove "County" from the end if it exists
    return countyName.replace(/\s+County$/i, '');
  };

  // Filter counties based on separate search fields
  const filteredCounties = useMemo(() => {
    const hasSearch = countySearch || citySearch || zipSearch;
    if (!hasSearch) return counties;
    
    let matches = new Set();
    
    // County name search
    if (countySearch) {
      const countyLower = countySearch.toLowerCase();
      counties.forEach(county => {
        if (county.toLowerCase().includes(countyLower)) {
          matches.add(county);
        }
      });
    }
    
    // City search
    if (citySearch) {
      const cityLower = citySearch.toLowerCase();
      zipCodes.forEach(zip => {
        if (zip.city?.toLowerCase().includes(cityLower) && zip.counties?.name) {
          matches.add(zip.counties.name);
        }
      });
    }
    
    // Zip code search
    if (zipSearch) {
      zipCodes.forEach(zip => {
        if (zip.zip_code?.includes(zipSearch) && zip.counties?.name) {
          matches.add(zip.counties.name);
        }
      });
    }
    
    return Array.from(matches);
  }, [counties, zipCodes, countySearch, citySearch, zipSearch]);

  // Highlight matching counties
  const highlightedCounties = useMemo(() => {
    const hasSearch = countySearch || citySearch || zipSearch;
    if (!hasSearch) return new Set();
    return new Set(filteredCounties);
  }, [filteredCounties, countySearch, citySearch, zipSearch]);

  if (loading) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <div className="bg-muted/10 border border-muted rounded-lg p-6">
      {/* Header with Search */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">
            {stateCode} Counties ({counties.length} total)
          </h4>
          <Badge variant="outline" className="text-sm">
            {filteredCounties.length} {countySearch || citySearch || zipSearch ? 'matching' : 'total'}
          </Badge>
        </div>
        
        {/* Three Search Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* County Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search counties..."
              value={countySearch}
              onChange={(e) => setCountySearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* City Search */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Zip Code Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search zip codes..."
              value={zipSearch}
              onChange={(e) => setZipSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Search Results Summary */}
        {(countySearch || citySearch || zipSearch) && (
          <div className="mt-2 text-sm text-muted-foreground">
            {filteredCounties.length > 0 ? (
              <>Found {filteredCounties.length} matching counties</>
            ) : (
              <>No counties found matching your search</>
            )}
          </div>
        )}
      </div>
      
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
        {counties.map((countyName) => {
          const isHighlighted = highlightedCounties.has(countyName);
          const isFiltered = (countySearch || citySearch || zipSearch) && !filteredCounties.includes(countyName);
          
          return (
            <div
              key={countyName}
              className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
                isFiltered 
                  ? 'opacity-30 scale-95' 
                  : isHighlighted 
                  ? 'ring-2 ring-blue-500 ring-offset-1 shadow-lg scale-105' 
                  : 'hover:opacity-80 hover:scale-105'
              }`}
              style={{ 
                backgroundColor: getCountyFill(countyName),
                borderColor: isHighlighted ? '#3b82f6' : 'transparent'
              }}
              onClick={() => onCountyClick?.(countyName)}
            >
              <div className="text-sm font-bold text-white leading-tight">
                {getCountyDisplayName(countyName)}
              </div>
              {countyData[countyName]?.active && (
                <div className="text-xs text-white mt-1">
                  {countyData[countyName].reps} rep{countyData[countyName].reps !== 1 ? 's' : ''}
                </div>
              )}
              {isHighlighted && (
                <div className="mt-1">
                  <MapPin className="h-3 w-3 text-white mx-auto" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Search Results List (when searching) */}
      {(countySearch || citySearch || zipSearch) && filteredCounties.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h5 className="font-semibold mb-3">Search Results:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredCounties.map((countyName) => (
              <div
                key={`search-${countyName}`}
                className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-muted/50"
                onClick={() => onCountyClick?.(countyName)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCountyFill(countyName) }}
                  />
                  <span className="font-medium">{getCountyDisplayName(countyName)}</span>
                </div>
                <Badge variant={countyData[countyName]?.active ? "default" : "secondary"} className="text-xs">
                  {countyData[countyName]?.active 
                    ? `${countyData[countyName].reps} reps` 
                    : countyData[countyName]?.requested 
                    ? 'Requested' 
                    : 'No coverage'
                  }
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        {(countySearch || citySearch || zipSearch)
          ? "Click on highlighted counties or search results for details" 
          : "Click on counties for detailed information"
        }
      </p>
    </div>
  );
};

export default DatabaseStateCountyMap;
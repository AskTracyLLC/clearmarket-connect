import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Search, ArrowLeft, ZoomIn, Loader } from 'lucide-react';
import { useStates } from '@/hooks/useLocationData';
import { useRealCoverageData } from '@/hooks/useRealCoverageData';
import { useAuth } from '@/contexts/AuthContext';
import USMap from './USMap';
import DatabaseStateCountyMap from '../DatabaseStateCountyMap';

// TypeScript interfaces
interface StateData {
  name: string;
  repCount: number;
}

interface CoverageSummary {
  states_with_coverage: number;
  total_field_reps: number;
  total_counties: number;
  states_needing_coverage: number;
}

const VendorCoverageMap = () => {
  const { states } = useStates();
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState<string>('');
  const [mapView, setMapView] = useState<'us' | 'state'>('us');
  const [selectedCounty, setSelectedCounty] = useState<string>('');

  const {
    statesWithCoverage,
    coverageSummary,
    loading,
    error,
  } = useRealCoverageData(user?.id) as {
    statesWithCoverage: Record<string, StateData>;
    coverageSummary: CoverageSummary | null;
    loading: boolean;
    error: string | null;
  };

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    setMapView('state');
  };

  const handleBackToUS = () => {
    setMapView('us');
    setSelectedState('');
    setSelectedCounty('');
  };

  const handleCountyClick = (countyName: string) => {
    setSelectedCounty(countyName);
    console.log(`Clicked on ${countyName} county`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Loading coverage data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading coverage data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const StateDetailMap = ({ stateCode }: { stateCode: string }) => {
    const stateData = statesWithCoverage[stateCode];
    
    return (
      <div className="space-y-6">
        {/* State Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stateData?.repCount || 0}
            </div>
            <div className="text-sm text-green-700">Field Reps</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <div className="text-sm text-yellow-700">Coverage Requested</div>
          </div>
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {states.find(s => s.code === stateCode)?.name || stateCode}
            </div>
            <div className="text-sm text-blue-700">State</div>
          </div>
        </div>

        {/* County Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>County Coverage in {states.find(s => s.code === stateCode)?.name}</span>
              <Button variant="outline" size="sm" onClick={handleBackToUS}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to US Map
              </Button>
            </CardTitle>
            <CardDescription>
              Interactive map showing field rep coverage by county
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseStateCountyMap 
              stateCode={stateCode}
              onCountyClick={handleCountyClick}
            />
          </CardContent>
        </Card>

        {/* Selected County Details */}
        {selectedCounty && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedCounty} County Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Coverage Status:</span>
                  <Badge variant="secondary">
                    Mock Data - Setup in Progress
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Detailed county information will be displayed here once coverage tracking is fully implemented.
                </p>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Field Reps
                  </Button>
                  <Button size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Request Coverage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            My Coverage Map
          </CardTitle>
          <CardDescription>
            Visual overview of your Field Rep network across the United States
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mapView === 'us' ? (
            <>
              {/* Coverage Summary */}
              {coverageSummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {coverageSummary.states_with_coverage}
                    </div>
                    <div className="text-sm text-muted-foreground">States with Coverage</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {coverageSummary.total_field_reps}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Field Reps</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {coverageSummary.total_counties}
                    </div>
                    <div className="text-sm text-muted-foreground">Counties Covered</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {coverageSummary.states_needing_coverage}
                    </div>
                    <div className="text-sm text-muted-foreground">States Needing Coverage</div>
                  </div>
                </div>
              )}

              {/* Interactive US Map */}
              <div className="bg-muted/10 border border-muted rounded-lg p-4 mb-6">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-semibold mb-2">Interactive US Coverage Map</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on states below to view detailed county coverage. Visual map integration coming soon.
                  </p>
                </div>
                
                {/* Show states as cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(statesWithCoverage).map(([stateCode, stateData]) => (
                    <Card 
                      key={stateCode}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleStateSelect(stateCode)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold">{stateCode}</div>
                        <div className="text-sm text-muted-foreground">{stateData.name}</div>
                        <Badge variant="secondary" className="mt-1">
                          {stateData.repCount} reps
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* State Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      View Any State (All 50 States Available):
                    </label>
                    <Select value={selectedState} onValueChange={handleStateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select any state..." />
                      </SelectTrigger>
                      <SelectContent>
                        {states?.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="mt-6">
                    <Search className="h-4 w-4 mr-2" />
                    Find Coverage
                  </Button>
                </div>

                {selectedState && mapView === 'us' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {states?.find(s => s.code === selectedState)?.name} Coverage
                        <Button variant="outline" size="sm" onClick={() => handleStateSelect(selectedState)}>
                          <ZoomIn className="h-4 w-4 mr-2" />
                          View County Map
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Click "View County Map" to see all counties in {states?.find(s => s.code === selectedState)?.name} 
                          with real county data from your database.
                        </p>
                        <Button className="w-full" onClick={() => handleStateSelect(selectedState)}>
                          <ZoomIn className="h-4 w-4 mr-2" />
                          View All Counties in {states?.find(s => s.code === selectedState)?.name}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <StateDetailMap stateCode={selectedState} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCoverageMap;
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Search, ArrowLeft, Zoom } from 'lucide-react';
import { useStates } from '@/hooks/useLocationData';
import USMap from './USMap';
import StateCountyMap from './StateCountyMap'; // Import the new component

const VendorCoverageMap = () => {
  const { states } = useStates();
  const [selectedState, setSelectedState] = useState<string>('');
  const [mapView, setMapView] = useState<'us' | 'state'>('us');
  const [selectedCounty, setSelectedCounty] = useState<string>('');

  // Mock data for states with coverage
  const statesWithCoverage = {
    'CA': { 
      name: 'California', 
      repCount: 5, 
      counties: ['Los Angeles', 'Orange', 'San Diego', 'Riverside', 'Santa Clara'],
      countiesWithCoverage: {
        'Los Angeles': { reps: 2, active: true },
        'Orange': { reps: 1, active: true },
        'San Diego': { reps: 1, active: true },
        'Riverside': { reps: 1, active: true },
        'Santa Clara': { reps: 0, active: false, requested: true },
        'San Francisco': { reps: 0, active: false, requested: false },
        'Sacramento': { reps: 0, active: false, requested: true },
        'Fresno': { reps: 0, active: false, requested: false }
      }
    },
    'TX': { 
      name: 'Texas', 
      repCount: 3, 
      counties: ['Harris', 'Dallas'],
      countiesWithCoverage: {
        'Harris': { reps: 2, active: true },
        'Dallas': { reps: 1, active: true },
        'Travis': { reps: 0, active: false, requested: true },
        'Bexar': { reps: 0, active: false, requested: false },
        'Tarrant': { reps: 0, active: false, requested: true },
        'Collin': { reps: 0, active: false, requested: false }
      }
    },
    'FL': { 
      name: 'Florida', 
      repCount: 2, 
      counties: ['Miami-Dade', 'Orange'],
      countiesWithCoverage: {
        'Miami-Dade': { reps: 1, active: true },
        'Orange': { reps: 1, active: true },
        'Broward': { reps: 0, active: false, requested: true },
        'Hillsborough': { reps: 0, active: false, requested: false },
        'Palm Beach': { reps: 0, active: false, requested: true },
        'Duval': { reps: 0, active: false, requested: false }
      }
    },
    'NY': { 
      name: 'New York', 
      repCount: 4, 
      counties: ['New York', 'Kings'],
      countiesWithCoverage: {
        'New York': { reps: 2, active: true },
        'Kings': { reps: 2, active: true },
        'Queens': { reps: 0, active: false, requested: true },
        'Bronx': { reps: 0, active: false, requested: true },
        'Richmond': { reps: 0, active: false, requested: false },
        'Nassau': { reps: 0, active: false, requested: false }
      }
    },
    'IL': { 
      name: 'Illinois', 
      repCount: 1, 
      counties: ['Cook'],
      countiesWithCoverage: {
        'Cook': { reps: 1, active: true },
        'DuPage': { reps: 0, active: false, requested: true },
        'Lake': { reps: 0, active: false, requested: false },
        'Will': { reps: 0, active: false, requested: true },
        'Kane': { reps: 0, active: false, requested: false },
        'McHenry': { reps: 0, active: false, requested: false }
      }
    }
  };

  const totalStates = Object.keys(statesWithCoverage).length;
  const totalReps = Object.values(statesWithCoverage).reduce((sum, state) => sum + state.repCount, 0);

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    if (stateCode && statesWithCoverage[stateCode as keyof typeof statesWithCoverage]) {
      setMapView('state');
    }
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

  const StateDetailMap = ({ stateCode }: { stateCode: string }) => {
    const stateData = statesWithCoverage[stateCode as keyof typeof statesWithCoverage];
    if (!stateData) return null;

    const counties = Object.entries(stateData.countiesWithCoverage);
    const activeCounties = counties.filter(([_, county]) => county.active).length;
    const requestedCounties = counties.filter(([_, county]) => county.requested).length;
    const totalCounties = counties.length;

    return (
      <div className="space-y-6">
        {/* State Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeCounties}</div>
            <div className="text-sm text-green-700">Counties with Reps</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{requestedCounties}</div>
            <div className="text-sm text-yellow-700">Coverage Requested</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{totalCounties - activeCounties - requestedCounties}</div>
            <div className="text-sm text-gray-700">No Coverage</div>
          </div>
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stateData.repCount}</div>
            <div className="text-sm text-blue-700">Total Field Reps</div>
          </div>
        </div>

        {/* Visual County Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Visual County Coverage in {stateData.name}</span>
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
            <StateCountyMap 
              stateCode={stateCode}
              counties={stateData.countiesWithCoverage}
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
              {(() => {
                const countyData = stateData.countiesWithCoverage[selectedCounty];
                if (!countyData) return <p>No data available for this county.</p>;
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Coverage Status:</span>
                      <Badge variant={
                        countyData.active ? "default" : 
                        countyData.requested ? "secondary" : "outline"
                      }>
                        {countyData.active ? "Active Coverage" : 
                         countyData.requested ? "Coverage Requested" : "No Coverage"}
                      </Badge>
                    </div>
                    
                    {countyData.active && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Field Reps:</span>
                        <span className="font-semibold">{countyData.reps} rep{countyData.reps !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {countyData.active ? (
                        <>
                          <Button variant="outline" size="sm">
                            View Field Reps
                          </Button>
                          <Button variant="outline" size="sm">
                            Message Reps
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Request Coverage
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* County Details List */}
        <Card>
          <CardHeader>
            <CardTitle>All Counties Overview</CardTitle>
            <CardDescription>
              Complete breakdown of coverage by county
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {counties.map(([countyName, countyData]) => (
                <div 
                  key={countyName} 
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCounty === countyName ? 'bg-primary/10 border-primary' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleCountyClick(countyName)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      countyData.active ? 'bg-green-500' : 
                      countyData.requested ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <div className="font-medium">{countyName} County</div>
                      <div className="text-sm text-muted-foreground">
                        {countyData.active 
                          ? `${countyData.reps} Field Rep${countyData.reps !== 1 ? 's' : ''} active`
                          : countyData.requested 
                          ? 'Coverage requested by vendor'
                          : 'No coverage or requests'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {countyData.active ? (
                      <Badge variant="default">Active</Badge>
                    ) : countyData.requested ? (
                      <Badge variant="secondary">Requested</Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Requesting coverage for ${countyName}`);
                      }}>
                        <Plus className="h-3 w-3 mr-1" />
                        Request
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalStates}</div>
                  <div className="text-sm text-muted-foreground">States with Coverage</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalReps}</div>
                  <div className="text-sm text-muted-foreground">Total Connected Reps</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">{50 - totalStates}</div>
                  <div className="text-sm text-muted-foreground">States Needing Coverage</div>
                </div>
              </div>

              {/* Interactive US Map */}
              <div className="bg-muted/10 border border-muted rounded-lg p-4 mb-6">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-semibold mb-2">Interactive US Coverage Map</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Map shows active Field Rep coverage based on your connected reps. Click on states for detailed county view.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded"></div>
                      <span className="text-xs">States with Coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                      <span className="text-xs">No Coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-xs">Coverage Requested</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative flex justify-center">
                  <USMap 
                    statesWithCoverage={statesWithCoverage}
                    onStateClick={handleStateSelect}
                    selectedState={selectedState}
                  />
                </div>
              </div>

              {/* State Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      View Detailed Coverage By State:
                    </label>
                    <Select value={selectedState} onValueChange={handleStateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state..." />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} {statesWithCoverage[state.code as keyof typeof statesWithCoverage] && 
                              `(${statesWithCoverage[state.code as keyof typeof statesWithCoverage].repCount} reps)`
                            }
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
                        {states.find(s => s.code === selectedState)?.name} Coverage
                        <Button variant="outline" size="sm" onClick={() => handleStateSelect(selectedState)}>
                          <Zoom className="h-4 w-4 mr-2" />
                          View County Map
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {statesWithCoverage[selectedState as keyof typeof statesWithCoverage] ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Connected Field Reps:</span>
                            <Badge variant="default">
                              {statesWithCoverage[selectedState as keyof typeof statesWithCoverage].repCount} reps
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium mb-2 block">Coverage Areas:</span>
                            <div className="flex flex-wrap gap-2">
                              {statesWithCoverage[selectedState as keyof typeof statesWithCoverage].counties.map((county) => (
                                <Badge key={county} variant="secondary">{county}</Badge>
                              ))}
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => handleStateSelect(selectedState)}>
                            <Zoom className="h-4 w-4 mr-2" />
                            View Visual County Map
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="text-muted-foreground mb-4">
                            No connected Field Reps in this state yet
                          </div>
                          <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Request Coverage
                          </Button>
                        </div>
                      )}
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
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Search } from 'lucide-react';
import { useStates } from '@/hooks/useLocationData';
import USMap from './USMap';

const VendorCoverageMap = () => {
  const { states } = useStates();
  const [selectedState, setSelectedState] = useState<string>('');

  // Mock data for states with coverage
  const statesWithCoverage = {
    'CA': { name: 'California', repCount: 5, counties: ['Los Angeles', 'Orange', 'San Diego'] },
    'TX': { name: 'Texas', repCount: 3, counties: ['Harris', 'Dallas'] },
    'FL': { name: 'Florida', repCount: 2, counties: ['Miami-Dade', 'Orange'] },
    'NY': { name: 'New York', repCount: 4, counties: ['New York', 'Kings'] },
    'IL': { name: 'Illinois', repCount: 1, counties: ['Cook'] }
  };

  const totalStates = Object.keys(statesWithCoverage).length;
  const totalReps = Object.values(statesWithCoverage).reduce((sum, state) => sum + state.repCount, 0);

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
                Map shows active Field Rep coverage based on your connected reps. Hover over states for details.
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
                onStateClick={setSelectedState}
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
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
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

            {selectedState && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {states.find(s => s.code === selectedState)?.name} Coverage
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
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCoverageMap;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Loader2, TrendingUp, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PricingData {
  inspectionType: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  sampleSize: number;
}

interface StateData {
  state: string;
  totalReps: number;
  avgPrice: number;
  inspectionTypesCount: number;
}

const AdminMarketPricing = () => {
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedInspectionType, setSelectedInspectionType] = useState<string>('all');
  const [states, setStates] = useState<string[]>([]);
  const [inspectionTypes, setInspectionTypes] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);

      const { data: coverageAreas, error } = await supabase
        .from('coverage_areas')
        .select('state_name, state_code, inspection_types, standard_price, rush_price, user_id');

      if (error) throw error;

      const pricingMap: { [key: string]: { prices: number[]; state: string } } = {};
      const stateMap: { [key: string]: Set<string> } = {};
      const uniqueStates = new Set<string>();
      const uniqueInspectionTypes = new Set<string>();

      coverageAreas?.forEach(area => {
        uniqueStates.add(area.state_name);
        
        if (!stateMap[area.state_name]) {
          stateMap[area.state_name] = new Set();
        }
        stateMap[area.state_name].add(area.user_id);
        
        const inspectionTypesData = area.inspection_types as any[];
        
        inspectionTypesData?.forEach((inspection: any) => {
          const type = inspection.inspectionType || inspection.type;
          const price = parseFloat(inspection.price || '0');
          
          if (type && price > 0) {
            uniqueInspectionTypes.add(type);
            
            const key = `${area.state_name}-${type}`;
            if (!pricingMap[key]) {
              pricingMap[key] = { prices: [], state: area.state_name };
            }
            pricingMap[key].prices.push(price);
          }
        });
      });

      // Calculate aggregated pricing data
      const aggregatedData: PricingData[] = Object.entries(pricingMap).map(([key, data]) => {
        const [state, inspectionType] = key.split('-');
        const prices = data.prices;
        
        return {
          inspectionType,
          state,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          avgPrice: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
          sampleSize: prices.length
        };
      });

      // Calculate state-level data
      const stateAggregates: StateData[] = Array.from(uniqueStates).map(state => {
        const statePricing = aggregatedData.filter(d => d.state === state);
        const avgPrice = statePricing.length > 0
          ? Math.round((statePricing.reduce((sum, d) => sum + d.avgPrice, 0) / statePricing.length) * 100) / 100
          : 0;
        
        return {
          state,
          totalReps: stateMap[state]?.size || 0,
          avgPrice,
          inspectionTypesCount: new Set(statePricing.map(d => d.inspectionType)).size
        };
      }).sort((a, b) => b.totalReps - a.totalReps);

      setPricingData(aggregatedData);
      setStateData(stateAggregates);
      setStates(Array.from(uniqueStates).sort());
      setInspectionTypes(Array.from(uniqueInspectionTypes).sort());

    } catch (error: any) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: "Error",
        description: "Failed to load market pricing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pricingData.filter(item => {
    if (selectedState !== 'all' && item.state !== selectedState) return false;
    if (selectedInspectionType !== 'all' && item.inspectionType !== selectedInspectionType) return false;
    return true;
  });

  const chartData = filteredData.slice(0, 15).map(item => ({
    name: selectedState === 'all' ? `${item.state} - ${item.inspectionType.substring(0, 20)}` : item.inspectionType,
    'Min Price': item.minPrice,
    'Avg Price': item.avgPrice,
    'Max Price': item.maxPrice
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Market Pricing Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          System-wide pricing intelligence and market trends
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="states">By State</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Markets</p>
                    <p className="text-2xl font-bold text-foreground">{pricingData.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">States Covered</p>
                    <p className="text-2xl font-bold text-foreground">{states.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inspection Types</p>
                    <p className="text-2xl font-bold text-foreground">{inspectionTypes.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Market Price</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${pricingData.length > 0 
                        ? Math.round(pricingData.reduce((sum, d) => sum + d.avgPrice, 0) / pricingData.length)
                        : 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top States Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top States by Field Rep Coverage</CardTitle>
              <CardDescription>States with the most active field representatives</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stateData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="state" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalReps" fill="hsl(var(--primary))" name="Field Reps" />
                  <Bar dataKey="inspectionTypesCount" fill="hsl(var(--accent))" name="Service Types" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>State Market Analysis</CardTitle>
              <CardDescription>Average pricing and coverage by state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">State</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Field Reps</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Service Types</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateData.map((item, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 text-sm font-medium text-foreground">{item.state}</td>
                        <td className="p-3 text-sm text-right text-foreground">{item.totalReps}</td>
                        <td className="p-3 text-sm text-right text-foreground">{item.inspectionTypesCount}</td>
                        <td className="p-3 text-sm text-right font-medium text-primary">${item.avgPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">State</label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Inspection Type</label>
                  <Select value={selectedInspectionType} onValueChange={setSelectedInspectionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {inspectionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Pricing Data</CardTitle>
              <CardDescription>Comprehensive pricing breakdown by market and service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">State</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Inspection Type</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Min</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Avg</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Max</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 text-sm text-foreground">{item.state}</td>
                        <td className="p-3 text-sm text-foreground">{item.inspectionType}</td>
                        <td className="p-3 text-sm text-right text-foreground">${item.minPrice}</td>
                        <td className="p-3 text-sm text-right font-medium text-primary">${item.avgPrice}</td>
                        <td className="p-3 text-sm text-right text-foreground">${item.maxPrice}</td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className="text-xs">{item.sampleSize}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pricing data available for selected filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMarketPricing;

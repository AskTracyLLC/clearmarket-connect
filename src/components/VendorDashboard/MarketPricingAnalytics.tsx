import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Loader2, TrendingUp, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PricingData {
  inspectionType: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  sampleSize: number;
}

const MarketPricingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
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

      // Fetch all coverage areas with pricing data
      const { data: coverageAreas, error } = await supabase
        .from('coverage_areas')
        .select('state_name, state_code, inspection_types, standard_price, rush_price');

      if (error) throw error;

      // Process data to extract pricing by state and inspection type
      const pricingMap: { [key: string]: { prices: number[]; state: string } } = {};
      const uniqueStates = new Set<string>();
      const uniqueInspectionTypes = new Set<string>();

      coverageAreas?.forEach(area => {
        uniqueStates.add(area.state_name);
        
        // Parse inspection_types JSON
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

      // Calculate min, max, avg for each state-inspection combination
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

      setPricingData(aggregatedData);
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

  // Prepare chart data
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Market Pricing Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View competitive pricing ranges in your target markets
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          Pro Feature
        </Badge>
      </div>

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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Entries</p>
                <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Market Price</p>
                <p className="text-2xl font-bold text-foreground">
                  ${filteredData.length > 0 
                    ? Math.round(filteredData.reduce((sum, d) => sum + d.avgPrice, 0) / filteredData.length)
                    : 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="text-2xl font-bold text-foreground">
                  ${filteredData.length > 0 ? Math.min(...filteredData.map(d => d.minPrice)) : 0} - 
                  ${filteredData.length > 0 ? Math.max(...filteredData.map(d => d.maxPrice)) : 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Range Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Ranges by Market</CardTitle>
          <CardDescription>
            Compare minimum, average, and maximum pricing across different markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={150}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => `$${value}`}
                />
                <Legend />
                <Bar dataKey="Min Price" fill="hsl(var(--muted))" />
                <Bar dataKey="Avg Price" fill="hsl(var(--primary))" />
                <Bar dataKey="Max Price" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pricing data available for selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Pricing Data</CardTitle>
          <CardDescription>
            Sample sizes indicate number of field reps offering services at these rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">State</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Inspection Type</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Min Price</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Avg Price</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Max Price</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Sample Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 20).map((item, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 text-sm text-foreground">{item.state}</td>
                    <td className="p-3 text-sm text-foreground">{item.inspectionType}</td>
                    <td className="p-3 text-sm text-right text-foreground">${item.minPrice}</td>
                    <td className="p-3 text-sm text-right font-medium text-primary">${item.avgPrice}</td>
                    <td className="p-3 text-sm text-right text-foreground">${item.maxPrice}</td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className="text-xs">
                        {item.sampleSize} {item.sampleSize === 1 ? 'rep' : 'reps'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing top 20 of {filteredData.length} results
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPricingAnalytics;

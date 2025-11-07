import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, MapPin, Calendar, Percent, Loader2 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface CoverageRequestAnalyticsProps {
  requestId: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

const CoverageRequestAnalytics = ({ requestId }: CoverageRequestAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [viewsOverTime, setViewsOverTime] = useState<any[]>([]);
  const [responseRate, setResponseRate] = useState<number>(0);
  const [geoBreakdown, setGeoBreakdown] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [uniqueViewers, setUniqueViewers] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [requestId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch views over time (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: viewsData, error: viewsError } = await supabase
        .from('coverage_request_views')
        .select('viewed_at, viewer_id')
        .eq('request_id', requestId)
        .gte('viewed_at', thirtyDaysAgo.toISOString())
        .order('viewed_at', { ascending: true });

      if (viewsError) throw viewsError;

      // Process views by day
      const viewsByDay: { [key: string]: number } = {};
      const uniqueViewersSet = new Set();
      
      viewsData?.forEach(view => {
        const day = format(new Date(view.viewed_at), 'MMM dd');
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
        uniqueViewersSet.add(view.viewer_id);
      });

      const viewsTimeData = Object.entries(viewsByDay).map(([date, count]) => ({
        date,
        views: count
      }));

      setViewsOverTime(viewsTimeData);
      setTotalViews(viewsData?.length || 0);
      setUniqueViewers(uniqueViewersSet.size);

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('coverage_request_responses')
        .select('field_rep_id, created_at, status')
        .eq('request_id', requestId);

      if (responsesError) throw responsesError;

      setTotalResponses(responsesData?.length || 0);

      // Calculate response rate
      const rate = uniqueViewersSet.size > 0 
        ? ((responsesData?.length || 0) / uniqueViewersSet.size) * 100 
        : 0;
      setResponseRate(Math.round(rate * 10) / 10);

      // Fetch geographic breakdown from coverage_areas
      if (responsesData && responsesData.length > 0) {
        const fieldRepIds = responsesData.map(r => r.field_rep_id);
        
        const { data: coverageData, error: coverageError } = await supabase
          .from('coverage_areas')
          .select('user_id, state_name')
          .in('user_id', fieldRepIds);

        if (coverageError) throw coverageError;

        // Group by state
        const stateBreakdown: { [key: string]: number } = {};
        coverageData?.forEach(coverage => {
          if (coverage.state_name) {
            stateBreakdown[coverage.state_name] = (stateBreakdown[coverage.state_name] || 0) + 1;
          }
        });

        const geoData = Object.entries(stateBreakdown)
          .map(([state, count]) => ({
            state,
            responses: count
          }))
          .sort((a, b) => b.responses - a.responses);

        setGeoBreakdown(geoData);
      }

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Viewers</p>
                <p className="text-2xl font-bold text-foreground">{uniqueViewers}</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Responses</p>
                <p className="text-2xl font-bold text-foreground">{totalResponses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-foreground">{responseRate}%</p>
              </div>
              <Percent className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="views" className="space-y-4">
        <TabsList>
          <TabsTrigger value="views">
            <Calendar className="h-4 w-4 mr-2" />
            Views Over Time
          </TabsTrigger>
          <TabsTrigger value="geography">
            <MapPin className="h-4 w-4 mr-2" />
            Geographic Interest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time (Last 30 Days)</CardTitle>
              <CardDescription>
                Track how many field reps are viewing your coverage request each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
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
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No view data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Breakdown of Responses</CardTitle>
              <CardDescription>
                See which states your interested field reps are located in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {geoBreakdown.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geoBreakdown}>
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
                      <Bar dataKey="responses" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={geoBreakdown}
                        dataKey="responses"
                        nameKey="state"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.state}: ${entry.responses}`}
                      >
                        {geoBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No response data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverageRequestAnalytics;

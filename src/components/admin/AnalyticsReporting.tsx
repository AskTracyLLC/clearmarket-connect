import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign,
  Download,
  Calendar,
  RefreshCw,
  Coins,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, parseISO, startOfWeek, startOfMonth } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CurrencyTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency_type: string;
  transaction_type: string;
  reference_type: string | null;
  created_at: string;
  metadata: any;
  user_name: string;
  anonymous_username: string;
  user_role: string;
}

export const AnalyticsReporting = () => {
  const [currencyTransactions, setCurrencyTransactions] = useState<CurrencyTransaction[]>([]);
  const [dateFilter, setDateFilter] = useState("7");
  const [loading, setLoading] = useState(false);
  const platformMetrics = [
    { label: "Active Users", value: "2,847", change: "+12%", icon: Users },
    { label: "Monthly Revenue", value: "$45,230", change: "+8%", icon: DollarSign },
    { label: "Coverage Requests", value: "1,234", change: "+15%", icon: Activity },
    { label: "Vendor Signups", value: "89", change: "+23%", icon: TrendingUp }
  ];

  const topStates = [
    { state: "Texas", requests: 234, growth: "+18%" },
    { state: "California", requests: 198, growth: "+12%" },
    { state: "Florida", requests: 156, growth: "+25%" },
    { state: "New York", requests: 134, growth: "+8%" },
    { state: "Illinois", requests: 98, growth: "+15%" }
  ];

  const recentReports = [
    { name: "Monthly User Activity", generated: "2024-01-15", size: "2.3 MB", type: "PDF" },
    { name: "Revenue Analysis Q4", generated: "2024-01-10", size: "1.8 MB", type: "Excel" },
    { name: "Coverage Gap Analysis", generated: "2024-01-08", size: "3.1 MB", type: "PDF" },
    { name: "Vendor Performance Report", generated: "2024-01-05", size: "2.7 MB", type: "PDF" }
  ];

  const fetchCurrencyTransactions = async () => {
    setLoading(true);
    try {
      let startDate = new Date();
      
      switch (dateFilter) {
        case "1":
          startDate = startOfDay(new Date());
          break;
        case "7":
          startDate = startOfDay(subDays(new Date(), 7));
          break;
        case "30":
          startDate = startOfDay(subDays(new Date(), 30));
          break;
        case "all":
          startDate = new Date(0);
          break;
      }

      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          id,
          user_id,
          amount,
          currency_type,
          transaction_type,
          reference_type,
          created_at,
          metadata
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Fetch user details
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, display_name, anonymous_username, role')
        .in('id', userIds);

      if (userError) throw userError;

      const userMap = new Map(userData?.map(u => [u.id, u]) || []);

      const transactions: CurrencyTransaction[] = (data || []).map(t => {
        const user = userMap.get(t.user_id);
        return {
          ...t,
          user_name: user?.display_name || 'Unknown',
          anonymous_username: user?.anonymous_username || '',
          user_role: user?.role || ''
        };
      });

      setCurrencyTransactions(transactions);
    } catch (error) {
      console.error('Error fetching currency transactions:', error);
      toast.error('Failed to fetch currency transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencyTransactions();
  }, [dateFilter]);

  const clearCreditsUsed = currencyTransactions
    .filter(t => t.currency_type === 'clear_credits' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const repPointsUsed = currencyTransactions
    .filter(t => t.currency_type === 'rep_points' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Prepare chart data - Daily trends
  const getDailyTrends = () => {
    const dailyMap = new Map<string, { date: string; clearCredits: number; repPoints: number }>();
    
    currencyTransactions
      .filter(t => t.amount < 0) // Only usage (negative amounts)
      .forEach(t => {
        const dateKey = format(parseISO(t.created_at), 'MMM dd');
        const existing = dailyMap.get(dateKey) || { date: dateKey, clearCredits: 0, repPoints: 0 };
        
        if (t.currency_type === 'clear_credits') {
          existing.clearCredits += Math.abs(t.amount);
        } else if (t.currency_type === 'rep_points') {
          existing.repPoints += Math.abs(t.amount);
        }
        
        dailyMap.set(dateKey, existing);
      });
    
    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Transaction type breakdown
  const getTransactionTypeBreakdown = () => {
    const typeMap = new Map<string, number>();
    
    currencyTransactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const type = t.transaction_type.replace(/_/g, ' ');
        typeMap.set(type, (typeMap.get(type) || 0) + Math.abs(t.amount));
      });
    
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  };

  // User role breakdown
  const getRoleBreakdown = () => {
    const roleMap = new Map<string, { clearCredits: number; repPoints: number }>();
    
    currencyTransactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const role = t.user_role || 'unknown';
        const existing = roleMap.get(role) || { clearCredits: 0, repPoints: 0 };
        
        if (t.currency_type === 'clear_credits') {
          existing.clearCredits += Math.abs(t.amount);
        } else if (t.currency_type === 'rep_points') {
          existing.repPoints += Math.abs(t.amount);
        }
        
        roleMap.set(role, existing);
      });
    
    return Array.from(roleMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      clearCredits: data.clearCredits,
      repPoints: data.repPoints
    }));
  };

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics & Reporting Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="currency">Currency Usage</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Platform Metrics</h3>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platformMetrics.map((metric, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <metric.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-xs text-green-600">{metric.change}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performing States</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topStates.map((state, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{state.state}</h4>
                            <p className="text-sm text-muted-foreground">{state.requests} requests</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {state.growth}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900">Peak Activity</h4>
                        <p className="text-sm text-blue-800">Tuesday 2-4 PM shows highest user engagement</p>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900">Growth Trend</h4>
                        <p className="text-sm text-green-800">25% increase in new vendor registrations this month</p>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-medium text-purple-900">Coverage Expansion</h4>
                        <p className="text-sm text-purple-800">3 new states added to coverage network</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <h4 className="text-2xl font-bold text-blue-600">1,456</h4>
                      <p className="text-sm text-muted-foreground">Field Representatives</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h4 className="text-2xl font-bold text-green-600">789</h4>
                      <p className="text-sm text-muted-foreground">Vendors</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h4 className="text-2xl font-bold text-purple-600">602</h4>
                      <p className="text-sm text-muted-foreground">Admin Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Activity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Interactive charts would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="currency" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Currency Usage Analytics</h3>
                <div className="flex items-center gap-3">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Today</SelectItem>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={fetchCurrencyTransactions}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Coins className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{clearCreditsUsed.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">ClearCredits Used</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{repPointsUsed.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">RepPoints Used</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              {!loading && currencyTransactions.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Usage Trends Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getDailyTrends()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="clearCredits" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="ClearCredits"
                            dot={{ fill: '#3b82f6' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="repPoints" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            name="RepPoints"
                            dot={{ fill: '#8b5cf6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Usage by User Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getRoleBreakdown()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="clearCredits" fill="#3b82f6" name="ClearCredits" />
                          <Bar dataKey="repPoints" fill="#8b5cf6" name="RepPoints" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Usage by Transaction Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={getTransactionTypeBreakdown()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getTransactionTypeBreakdown().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '0.5rem'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : currencyTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No transactions found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Used For</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currencyTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-sm">
                                {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{transaction.user_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {transaction.anonymous_username}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {transaction.user_role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={transaction.currency_type === 'clear_credits' ? 'default' : 'secondary'}
                                  className="capitalize"
                                >
                                  {transaction.currency_type === 'clear_credits' ? (
                                    <><Coins className="h-3 w-3 mr-1" />ClearCredits</>
                                  ) : (
                                    <><Award className="h-3 w-3 mr-1" />RepPoints</>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="capitalize">
                                {transaction.transaction_type.replace(/_/g, ' ')}
                              </TableCell>
                              <TableCell className="capitalize">
                                {transaction.reference_type?.replace(/_/g, ' ') || 'N/A'}
                              </TableCell>
                              <TableCell className={`text-right font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">$45,230</p>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-xs text-green-600">+8% from last month</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">$1,847</p>
                      <p className="text-sm text-muted-foreground">Avg. Revenue per User</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">23.5%</p>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="text-xs text-green-600">+3% from last month</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Search Credits</h4>
                        <p className="text-sm text-muted-foreground">Field rep credit purchases</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$28,450</p>
                        <p className="text-sm text-green-600">63% of total</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Premium Subscriptions</h4>
                        <p className="text-sm text-muted-foreground">Monthly vendor subscriptions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$12,780</p>
                        <p className="text-sm text-green-600">28% of total</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Profile Boosts</h4>
                        <p className="text-sm text-muted-foreground">Profile visibility features</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$4,000</p>
                        <p className="text-sm text-green-600">9% of total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generate Reports</h3>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "User Activity Summary",
                      "Revenue Analysis",
                      "Coverage Gap Report",
                      "Vendor Performance",
                      "System Health Check"
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{report}</span>
                        <Button variant="outline" size="sm">
                          Generate
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentReports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {report.generated} • {report.size} • {report.type}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
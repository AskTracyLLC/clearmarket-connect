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
  RefreshCw
} from "lucide-react";

export const AnalyticsReporting = () => {
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Server,
  HardDrive,
  Activity
} from "lucide-react";
import { useState } from "react";

export const DatabaseAdministration = () => {
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);

  const dbStats = [
    { label: "Total Tables", value: "47", icon: Database },
    { label: "Active Connections", value: "23", icon: Activity },
    { label: "Storage Used", value: "2.3 GB", icon: HardDrive },
    { label: "Uptime", value: "99.9%", icon: CheckCircle }
  ];

  const recentQueries = [
    { query: "SELECT COUNT(*) FROM users", time: "2 mins ago", status: "success" },
    { query: "UPDATE profiles SET...", time: "5 mins ago", status: "success" },
    { query: "SELECT * FROM coverage_requests", time: "8 mins ago", status: "success" },
    { query: "DELETE FROM expired_sessions", time: "15 mins ago", status: "success" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Administration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="query">SQL Query</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dbStats.map((stat, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <stat.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{query.query}</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{query.time}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="query" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Direct database access should be used with extreme caution. 
                    Always backup before making changes.
                  </p>
                </div>
              </div>
              
              <Textarea
                placeholder="Enter your SQL query here..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                rows={6}
                className="font-mono"
              />
              
              <div className="flex gap-2">
                <Button onClick={() => setQueryResult("Query executed successfully")}>
                  Execute Query
                </Button>
                <Button variant="outline">
                  Explain Query
                </Button>
                <Button variant="outline">
                  Save Query
                </Button>
              </div>

              {queryResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Query Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-sm">{queryResult}</code>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tables" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input placeholder="Search tables..." className="max-w-md" />
              </div>
              
              <div className="space-y-2">
                {["users", "profiles", "vendor_profiles", "field_rep_profiles", "coverage_requests", "reviews"].map((table, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{table}</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 10000)} rows
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Schema</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Database Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Automatic Backups</h4>
                        <p className="text-sm text-muted-foreground">Daily backups at 2:00 AM UTC</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button>Create Manual Backup</Button>
                      <Button variant="outline">View Backup History</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "2024-01-15 02:00", size: "245 MB", type: "Automatic" },
                      { date: "2024-01-14 02:00", size: "243 MB", type: "Automatic" },
                      { date: "2024-01-13 14:30", size: "241 MB", type: "Manual" }
                    ].map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{backup.date}</p>
                            <p className="text-sm text-muted-foreground">{backup.size} • {backup.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Download</Button>
                          <Button variant="outline" size="sm">Restore</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
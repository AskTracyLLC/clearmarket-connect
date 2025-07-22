import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useState } from "react";

export const SecurityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const securityAlerts = [
    {
      id: 1,
      type: "Failed Login",
      severity: "medium",
      user: "unknown@example.com",
      timestamp: "2024-01-15 14:30:22",
      ip: "192.168.1.100",
      status: "investigating"
    },
    {
      id: 2,
      type: "Suspicious Activity",
      severity: "high",
      user: "john.doe@email.com",
      timestamp: "2024-01-15 13:15:45",
      ip: "10.0.0.1",
      status: "resolved"
    },
    {
      id: 3,
      type: "Rate Limit Exceeded",
      severity: "low",
      user: "api_user_456",
      timestamp: "2024-01-15 12:45:12",
      ip: "203.0.113.0",
      status: "blocked"
    }
  ];

  const loginAttempts = [
    { ip: "192.168.1.100", attempts: 5, lastAttempt: "2 mins ago", status: "blocked" },
    { ip: "10.0.0.1", attempts: 3, lastAttempt: "5 mins ago", status: "monitoring" },
    { ip: "172.16.0.1", attempts: 2, lastAttempt: "10 mins ago", status: "normal" }
  ];

  const securityMetrics = [
    { label: "Active Sessions", value: "247", icon: Activity },
    { label: "Failed Logins (24h)", value: "12", icon: XCircle },
    { label: "Blocked IPs", value: "8", icon: Shield },
    { label: "Security Score", value: "98%", icon: CheckCircle }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'investigating':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Investigating</Badge>;
      case 'blocked':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitoring Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Security Alerts</h3>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {securityMetrics.map((metric, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <metric.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <AlertTriangle className={`h-5 w-5 ${
                            alert.severity === 'high' ? 'text-red-500' : 
                            alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <div>
                            <h4 className="font-medium">{alert.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {alert.user} • {alert.ip} • {alert.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search user activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Export Logs</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Failed Login Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loginAttempts.map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">IP: {attempt.ip}</h4>
                          <p className="text-sm text-muted-foreground">
                            {attempt.attempts} attempts • Last: {attempt.lastAttempt}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={attempt.status === 'blocked' ? 'destructive' : 'secondary'}>
                            {attempt.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            {attempt.status === 'blocked' ? 'Unblock' : 'Block'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active User Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { user: "admin@clearmarket.com", location: "New York, US", duration: "2h 15m", device: "Chrome/Desktop" },
                      { user: "john.doe@email.com", location: "Dallas, TX", duration: "45m", device: "Safari/Mobile" },
                      { user: "jane.smith@email.com", location: "Miami, FL", duration: "1h 30m", device: "Firefox/Desktop" }
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{session.user}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.location} • {session.device} • {session.duration}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Terminate
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="access" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Access Control Lists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">IP Whitelist</h4>
                        <p className="text-sm text-muted-foreground">12 approved IP addresses</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">IP Blacklist</h4>
                        <p className="text-sm text-muted-foreground">8 blocked IP addresses</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Rate Limiting</h4>
                        <p className="text-sm text-muted-foreground">100 requests per minute per IP</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { role: "Super Admin", users: 2, permissions: "Full Access" },
                      { role: "Admin", users: 5, permissions: "System Management" },
                      { role: "Moderator", users: 12, permissions: "Content Moderation" },
                      { role: "Vendor", users: 789, permissions: "Profile Management" },
                      { role: "Field Rep", users: 1456, permissions: "Search & Contact" }
                    ].map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{role.role}</h4>
                          <p className="text-sm text-muted-foreground">
                            {role.users} users • {role.permissions}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit Permissions</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password Policy</h4>
                      <p className="text-sm text-muted-foreground">Minimum 8 characters, mixed case, numbers</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">Auto logout after 8 hours</p>
                    </div>
                    <Button variant="outline" size="sm">Adjust</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Monitoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Real-time Alerts</h4>
                      <p className="text-sm text-muted-foreground">Email notifications for security events</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Audit Logging</h4>
                      <p className="text-sm text-muted-foreground">Comprehensive activity logging</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Automated Blocking</h4>
                      <p className="text-sm text-muted-foreground">Auto-block suspicious IP addresses</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
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
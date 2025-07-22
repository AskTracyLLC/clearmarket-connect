
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  User,
  Settings,
  Shield,
  Database,
  FileText,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export const AdminAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Mock audit log data - in real app this would come from database
  const auditLogs = [
    {
      id: "1",
      action: "user_role_updated",
      target: "User Profile",
      description: "Updated user role from field_rep to vendor",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      severity: "medium",
      ip: "192.168.1.100"
    },
    {
      id: "2", 
      action: "system_settings_modified",
      target: "System Configuration",
      description: "Modified credit earning rules",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      severity: "high",
      ip: "192.168.1.100"
    },
    {
      id: "3",
      action: "document_verified",
      target: "Document Management",
      description: "Verified user insurance certificate",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      severity: "low",
      ip: "192.168.1.100"
    },
    {
      id: "4",
      action: "content_moderated",
      target: "Community Post",
      description: "Removed flagged community post",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      severity: "medium",
      ip: "192.168.1.100"
    },
    {
      id: "5",
      action: "database_query",
      target: "Database",
      description: "Executed user analytics query",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      severity: "low",
      ip: "192.168.1.100"
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return <User className="h-4 w-4" />;
    if (action.includes('system')) return <Settings className="h-4 w-4" />;
    if (action.includes('document')) return <FileText className="h-4 w-4" />;
    if (action.includes('content')) return <Shield className="h-4 w-4" />;
    if (action.includes('database')) return <Database className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || log.severity === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Administrative Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Audit Log Entries */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                    {getSeverityBadge(log.severity)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(log.timestamp, 'MMM d, yyyy h:mm a')}
                    </div>
                    <div>Target: {log.target}</div>
                    <div>IP: {log.ip}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No audit logs found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

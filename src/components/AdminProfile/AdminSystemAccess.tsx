
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  CreditCard,
  Crown,
  Check,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminSystemAccess = () => {
  const navigate = useNavigate();

  const accessModules = [
    {
      name: "User Management",
      icon: Users,
      description: "Full access to user accounts, roles, and permissions",
      status: "active",
      lastUsed: "2 hours ago",
      route: "/admin"
    },
    {
      name: "Content Moderation",
      icon: MessageSquare,
      description: "Manage community posts, comments, and reported content",
      status: "active",
      lastUsed: "1 day ago",
      route: "/admin",
      tab: "moderation"
    },
    {
      name: "System Settings",
      icon: Settings,
      description: "Configure platform settings and system parameters",
      status: "active",
      lastUsed: "3 days ago",
      route: "/admin",
      tab: "system"
    },
    {
      name: "Database Administration",
      icon: Database,
      description: "Direct database access and management tools",
      status: "active",
      lastUsed: "1 week ago",
      route: "/admin/database"
    },
    {
      name: "Analytics & Reporting",
      icon: BarChart3,
      description: "View platform analytics and generate reports",
      status: "active",
      lastUsed: "Today",
      route: "/admin/analytics"
    },
    {
      name: "Document Management",
      icon: FileText,
      description: "Access all user documents and verification systems",
      status: "active",
      lastUsed: "Today",
      route: "/admin/documents"
    },
    {
      name: "Credit System",
      icon: CreditCard,
      description: "Manage user credits, transactions, and overrides",
      status: "active",
      lastUsed: "2 days ago",
      route: "/admin",
      tab: "credits"
    },
    {
      name: "Security Monitoring", 
      icon: Shield,
      description: "Monitor security events and manage access controls",
      status: "active",
      lastUsed: "Today",
      route: "/admin/security"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Active</Badge>;
      case 'restricted':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Restricted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleAccess = (module: any) => {
    if (module.route) {
      if (module.tab) {
        navigate(`${module.route}?tab=${module.tab}`);
      } else {
        navigate(module.route);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              System Access Control
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Administrator Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {accessModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <module.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{module.name}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last used: {module.lastUsed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(module.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAccess(module)}
                  >
                    Access
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Active Permissions</h4>
              <div className="space-y-2">
                {[
                  "Full User Management",
                  "Content Moderation",
                  "System Configuration",
                  "Database Access",
                  "Audit Log Access",
                  "Credit System Override",
                  "Document Verification",
                  "Platform Analytics"
                ].map((permission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Security Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Authentication</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Timeout</span>
                  <Badge variant="secondary">8 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IP Restrictions</span>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit Logging</span>
                  <Badge className="bg-blue-100 text-blue-800">Full</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

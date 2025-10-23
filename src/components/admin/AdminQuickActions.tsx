import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Users, 
  MessageSquare, 
  CreditCard, 
  Database,
  Settings,
  Calendar,
  Plus,
  BarChart3,
  Wrench,
  Network,
  Coins
} from "lucide-react";

interface AdminQuickActionsProps {
  onTabChange?: (tab: string) => void;
}

export const AdminQuickActions = ({ onTabChange }: AdminQuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Content & Community */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onTabChange?.('content')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Content & Community
        </Button>

        {/* Users & Access */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onTabChange?.('users')}
        >
          <Users className="h-4 w-4 mr-2" />
          Users & Access
        </Button>

        {/* Financial */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onTabChange?.('financial')}
        >
          <Coins className="h-4 w-4 mr-2" />
          Financial Management
        </Button>

        {/* System & Data */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onTabChange?.('system')}
        >
          <Wrench className="h-4 w-4 mr-2" />
          System & Data
        </Button>

        {/* Analytics & Reports */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onTabChange?.('analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics & Reports
        </Button>

        <Separator />

        {/* Quick Links */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">Quick Links</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onTabChange?.('content')}
          >
            <Calendar className="h-3 w-3 mr-2" />
            Schedule Discussion
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onTabChange?.('users')}
          >
            <Network className="h-3 w-3 mr-2" />
            Manage Connections
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onTabChange?.('system')}
          >
            <Database className="h-3 w-3 mr-2" />
            ZIP/County Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
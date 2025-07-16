import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Users, 
  MapPin, 
  MessageSquare, 
  CreditCard, 
  Database,
  FileDown,
  Search,
  AlertTriangle,
  Settings,
  Calendar,
  Plus
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
      <CardContent className="space-y-4">
        {/* User Management */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" className="justify-start">
              Vendor Directory
            </Button>
            <Button variant="ghost" size="sm" className="justify-start">
              Field Rep Directory
            </Button>
          </div>
        </div>

        <Separator />

        {/* Community Scheduler */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Community Scheduler
          </h4>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => onTabChange?.('scheduler')}
            >
              <Plus className="h-3 w-3 mr-2" />
              Schedule Discussion
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Upcoming Posts
            </Button>
          </div>
        </div>

        <Separator />

        {/* Content Moderation */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Content Moderation
          </h4>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <AlertTriangle className="h-3 w-3 mr-2" />
              Review Flagged Content
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Coverage Requests
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Community Posts
            </Button>
          </div>
        </div>

        <Separator />

        {/* Data Management */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Management
          </h4>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Search className="h-3 w-3 mr-2" />
              Search ZIP Codes
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <FileDown className="h-3 w-3 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <Separator />

        {/* Financial */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Financial
          </h4>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Transaction Logs
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Revenue Reports
            </Button>
          </div>
        </div>

        <Separator />

        {/* System */}
        <div>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="h-3 w-3 mr-2" />
            System Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flag, 
  MessageSquare, 
  AlertTriangle, 
  ClipboardList,
  Search,
  UserX,
  Eye,
  FileText
} from "lucide-react";

export const ModeratorQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <Flag className="h-4 w-4" />
          Review All Flags
          <Badge variant="destructive" className="ml-auto">4</Badge>
        </Button>
        
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <AlertTriangle className="h-4 w-4" />
          Dispute Resolution
          <Badge variant="secondary" className="ml-auto">8</Badge>
        </Button>
        
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <Search className="h-4 w-4" />
          User Search
        </Button>
        
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <UserX className="h-4 w-4" />
          Manage Restrictions
        </Button>
        
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <Eye className="h-4 w-4" />
          Trust Score Review
        </Button>
        
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
        
        <Button size="sm" variant="outline" className="w-full justify-start gap-2">
          <ClipboardList className="h-4 w-4" />
          Action History
        </Button>
      </CardContent>
    </Card>
  );
};
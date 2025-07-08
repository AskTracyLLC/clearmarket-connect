import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flag, 
  MessageSquare, 
  AlertTriangle, 
  ClipboardList,
  Search,
  UserX
} from "lucide-react";

export const ModeratorStatsCards = () => {
  // Mock data - would be fetched from database in real implementation
  const stats = {
    flaggedPosts: { total: 12, urgent: 3 },
    flaggedComments: { total: 8, urgent: 1 },
    reviewDisputes: { vendor: 5, fieldRep: 3 },
    recentActions: 15,
    searchRequests: 2,
    restrictedUsers: 4
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Flagged Posts */}
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flagged Posts</CardTitle>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground" />
            {stats.flaggedPosts.urgent > 0 && (
              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {stats.flaggedPosts.urgent}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.flaggedPosts.total}</div>
          <p className="text-xs text-muted-foreground mb-3">
            {stats.flaggedPosts.urgent} requiring immediate review
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Review Flagged Posts
          </Button>
        </CardContent>
      </Card>

      {/* Flagged Comments */}
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flagged Comments</CardTitle>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            {stats.flaggedComments.urgent > 0 && (
              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {stats.flaggedComments.urgent}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.flaggedComments.total}</div>
          <p className="text-xs text-muted-foreground mb-3">
            {stats.flaggedComments.urgent} requiring immediate review
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Review Comments
          </Button>
        </CardContent>
      </Card>

      {/* Review Disputes */}
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Review Disputes</CardTitle>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            {(stats.reviewDisputes.vendor + stats.reviewDisputes.fieldRep) > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {stats.reviewDisputes.vendor + stats.reviewDisputes.fieldRep}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.reviewDisputes.vendor + stats.reviewDisputes.fieldRep}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {stats.reviewDisputes.vendor} vendor, {stats.reviewDisputes.fieldRep} field rep
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Resolve Disputes
          </Button>
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Actions</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentActions}</div>
          <p className="text-xs text-muted-foreground mb-3">
            Actions taken this week
          </p>
          <Button size="sm" variant="outline" className="w-full">
            View Action Log
          </Button>
        </CardContent>
      </Card>

      {/* Search & Investigation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Investigations</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.searchRequests}</div>
          <p className="text-xs text-muted-foreground mb-3">
            Users under review
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Search Users
          </Button>
        </CardContent>
      </Card>

      {/* Restricted Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Restricted Users</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.restrictedUsers}</div>
          <p className="text-xs text-muted-foreground mb-3">
            Currently restricted
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Manage Restrictions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
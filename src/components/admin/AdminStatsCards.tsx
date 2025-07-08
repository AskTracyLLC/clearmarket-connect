import { Users, MapPin, MessageSquare, Star, CreditCard, Database, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  description?: string;
  actions?: React.ReactNode;
  urgentCount?: number;
}

const StatsCard = ({ title, count, icon: Icon, description, actions, urgentCount }: StatsCardProps) => (
  <Card className="relative">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="relative">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {urgentCount && urgentCount > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {urgentCount}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{count.toLocaleString()}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {actions && (
        <div className="mt-4 space-y-2">
          {actions}
        </div>
      )}
    </CardContent>
  </Card>
);

export const AdminStatsCards = () => {
  // Mock data - replace with actual API calls
  const stats = {
    vendors: 156,
    fieldReps: 243,
    coverageRequests: 34,
    communityPosts: 89,
    flaggedPosts: 7,
    pendingVendorReviews: 12,
    pendingRepReviews: 8,
    monthlyUnlocks: 45,
    monthlyBoosts: 23,
    totalRevenue: 2847,
    totalZips: 41692,
    ruralZips: 28456,
    urbanZips: 13236,
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Vendors */}
      <StatsCard
        title="Total Vendors"
        count={stats.vendors}
        icon={Users}
        description="Active vendor accounts"
        actions={
          <>
            <Button variant="outline" size="sm" className="w-full">
              View Vendor Directory
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Login as Vendor (Support)
            </Button>
          </>
        }
      />

      {/* Total Field Reps */}
      <StatsCard
        title="Total Field Reps"
        count={stats.fieldReps}
        icon={Users}
        description="Active field rep accounts"
        actions={
          <>
            <Button variant="outline" size="sm" className="w-full">
              View Field Rep Directory
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Login as Field Rep (Support)
            </Button>
          </>
        }
      />

      {/* Active Coverage Requests */}
      <StatsCard
        title="Coverage Requests"
        count={stats.coverageRequests}
        icon={MapPin}
        description="Open seeking coverage posts"
        actions={
          <>
            <Button variant="outline" size="sm" className="w-full">
              View All Posts
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Moderate Posts
            </Button>
          </>
        }
      />

      {/* Community Board Posts */}
      <StatsCard
        title="Community Posts"
        count={stats.communityPosts}
        icon={MessageSquare}
        description={`${stats.flaggedPosts} flagged posts need review`}
        urgentCount={stats.flaggedPosts}
        actions={
          <>
            <Button variant="outline" size="sm" className="w-full">
              Review Flagged Posts
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Moderate Community
            </Button>
          </>
        }
      />

      {/* Pending Reviews */}
      <StatsCard
        title="Pending Reviews"
        count={stats.pendingVendorReviews + stats.pendingRepReviews}
        icon={Star}
        description={`${stats.pendingVendorReviews} vendor, ${stats.pendingRepReviews} field rep`}
        urgentCount={stats.pendingVendorReviews + stats.pendingRepReviews}
        actions={
          <>
            <Button variant="outline" size="sm" className="w-full">
              Review Queue
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Export Review Data
            </Button>
          </>
        }
      />

      {/* Transactions */}
      <StatsCard
        title="Monthly Transactions"
        count={stats.monthlyUnlocks + stats.monthlyBoosts}
        icon={CreditCard}
        description={`$${stats.totalRevenue.toLocaleString()} revenue | ${stats.monthlyUnlocks} unlocks, ${stats.monthlyBoosts} boosts`}
        actions={
          <>
            <Button variant="outline" size="sm" className="w-full">
              View Transaction Logs
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Export CSV
            </Button>
          </>
        }
      />

      {/* ZIP & County Classification - Spans 2 columns on larger screens */}
      <div className="md:col-span-2 lg:col-span-1">
        <StatsCard
          title="ZIP Classification"
          count={stats.totalZips}
          icon={Database}
          description={`${stats.ruralZips.toLocaleString()} Rural | ${stats.urbanZips.toLocaleString()} Urban`}
          actions={
            <>
              <Button variant="outline" size="sm" className="w-full">
                Upload CSV Data
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Search & Edit ZIPs
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
};
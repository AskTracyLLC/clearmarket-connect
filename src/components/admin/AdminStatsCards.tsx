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
  onClick?: () => void;
  clickableNumber?: boolean;
}

const StatsCard = ({ title, count, icon: Icon, description, actions, urgentCount, onClick, clickableNumber }: StatsCardProps) => (
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
      {clickableNumber && onClick ? (
        <button 
          onClick={onClick}
          className="text-2xl font-bold hover:text-primary transition-colors cursor-pointer text-left"
        >
          {count.toLocaleString()}
        </button>
      ) : (
        <div className="text-2xl font-bold">{count.toLocaleString()}</div>
      )}
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

  const handleVendorDirectoryClick = () => {
    console.log("Navigate to Vendor Directory");
    // Add navigation logic here
  };

  const handleFieldRepDirectoryClick = () => {
    console.log("Navigate to Field Rep Directory");
    // Add navigation logic here
  };

  const handleCoverageRequestsClick = () => {
    console.log("Navigate to Coverage Requests");
    // Add navigation logic here
  };

  const handleFlaggedPostsClick = () => {
    console.log("Navigate to Flagged Posts Review");
    // Add navigation logic here
  };

  const handlePendingReviewsClick = () => {
    console.log("Navigate to Review Queue");
    // Add navigation logic here
  };

  const handleTransactionsClick = () => {
    console.log("Navigate to Transaction Logs");
    // Add navigation logic here
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Vendors */}
      <StatsCard
        title="Total Vendors"
        count={stats.vendors}
        icon={Users}
        description="Active vendor accounts"
        clickableNumber={true}
        onClick={handleVendorDirectoryClick}
        actions={
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Login as Vendor (Support)
          </Button>
        }
      />

      {/* Total Field Reps */}
      <StatsCard
        title="Total Field Reps"
        count={stats.fieldReps}
        icon={Users}
        description="Active field rep accounts"
        clickableNumber={true}
        onClick={handleFieldRepDirectoryClick}
        actions={
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Login as Field Rep (Support)
          </Button>
        }
      />

      {/* Active Coverage Requests */}
      <StatsCard
        title="Coverage Requests"
        count={stats.coverageRequests}
        icon={MapPin}
        description="Open seeking coverage posts"
        clickableNumber={true}
        onClick={handleCoverageRequestsClick}
        actions={
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Moderate Posts
          </Button>
        }
      />

      {/* Community Posts - Show only flagged posts count */}
      <StatsCard
        title="Community Posts"
        count={stats.flaggedPosts}
        icon={MessageSquare}
        description="flagged posts need review"
        urgentCount={stats.flaggedPosts}
        clickableNumber={true}
        onClick={handleFlaggedPostsClick}
        actions={
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Moderate Community
          </Button>
        }
      />

      {/* Pending Reviews */}
      <StatsCard
        title="Pending Reviews"
        count={stats.pendingVendorReviews + stats.pendingRepReviews}
        icon={Star}
        description={`${stats.pendingVendorReviews} vendor, ${stats.pendingRepReviews} field rep`}
        urgentCount={stats.pendingVendorReviews + stats.pendingRepReviews}
        clickableNumber={true}
        onClick={handlePendingReviewsClick}
        actions={
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Export Review Data
          </Button>
        }
      />

      {/* Transactions */}
      <StatsCard
        title="Monthly Transactions"
        count={stats.monthlyUnlocks + stats.monthlyBoosts}
        icon={CreditCard}
        description={`$${stats.totalRevenue.toLocaleString()} revenue | ${stats.monthlyUnlocks} unlocks, ${stats.monthlyBoosts} boosts`}
        clickableNumber={true}
        onClick={handleTransactionsClick}
        actions={
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Export CSV
          </Button>
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
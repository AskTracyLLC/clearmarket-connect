import { Users, MapPin, MessageSquare, Star, CreditCard, Database, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    vendors: 0,
    fieldReps: 0,
    coverageRequests: 0,
    communityPosts: 0,
    flaggedPosts: 0,
    monthlyUnlocks: 0,
    monthlyBoosts: 0,
    totalRevenue: 0,
    totalZips: 0,
    ruralZips: 0,
    urbanZips: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Fetch user counts from users table by role
      const { count: vendorCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor');

      const { count: fieldRepCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'field_rep');

      // Fetch coverage and posts
      const { count: coverageCount } = await supabase
        .from('coverage_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: postsCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      const { count: flaggedCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('flagged', true);

      // Fetch ZIP data
      const { count: totalZipsCount } = await supabase
        .from('zip_county_classifications')
        .select('*', { count: 'exact', head: true });

      const { count: ruralZipsCount } = await supabase
        .from('zip_county_classifications')
        .select('*', { count: 'exact', head: true })
        .eq('rural_urban_designation', 'Rural');

      const { count: urbanZipsCount } = await supabase
        .from('zip_county_classifications')
        .select('*', { count: 'exact', head: true })
        .eq('rural_urban_designation', 'Urban');

      // Fetch transactions
      const { count: unlocksCount } = await supabase
        .from('contact_unlocks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { data: creditsData } = await supabase
        .from('credit_transactions')
        .select('amount, transaction_type')
        .gte('created_at', startOfMonth.toISOString())
        .in('transaction_type', ['unlock_contact', 'boost_profile']);

      const totalRevenue = creditsData?.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0) || 0;
      const monthlyBoosts = creditsData?.filter(tx => tx.transaction_type === 'boost_profile').length || 0;

      setStats({
        vendors: vendorCount || 0,
        fieldReps: fieldRepCount || 0,
        coverageRequests: coverageCount || 0,
        communityPosts: postsCount || 0,
        flaggedPosts: flaggedCount || 0,
        monthlyUnlocks: unlocksCount || 0,
        monthlyBoosts,
        totalRevenue,
        totalZips: totalZipsCount || 0,
        ruralZips: ruralZipsCount || 0,
        urbanZips: urbanZipsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error loading stats",
        description: "Failed to fetch admin statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading admin statistics...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Vendors"
        count={stats.vendors}
        icon={Users}
        description="Active vendor accounts"
      />

      <StatsCard
        title="Total Field Reps"
        count={stats.fieldReps}
        icon={Users}
        description="Active field rep accounts"
      />

      <StatsCard
        title="Coverage Requests"
        count={stats.coverageRequests}
        icon={MapPin}
        description="Open seeking coverage posts"
      />

      <StatsCard
        title="Flagged Posts"
        count={stats.flaggedPosts}
        icon={MessageSquare}
        description="Posts needing review"
        urgentCount={stats.flaggedPosts}
      />

      <StatsCard
        title="Monthly Transactions"
        count={stats.monthlyUnlocks + stats.monthlyBoosts}
        icon={CreditCard}
        description={`${stats.monthlyUnlocks} unlocks, ${stats.monthlyBoosts} boosts`}
      />

      <StatsCard
        title="ZIP Classification"
        count={stats.totalZips}
        icon={Database}
        description={`${stats.ruralZips.toLocaleString()} Rural | ${stats.urbanZips.toLocaleString()} Urban`}
      />
    </div>
  );
};

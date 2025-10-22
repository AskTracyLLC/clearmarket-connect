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

      const [vendors, fieldReps, coverage, posts, flagged, zips, rural, urban, unlocks, credits] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'vendor'),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'field-rep'),
        supabase.from('coverage_requests').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('flagged', true),
        supabase.from('zip_county_classifications').select('*', { count: 'exact', head: true }),
        supabase.from('zip_county_classifications').select('*', { count: 'exact', head: true }).eq('rural_urban', 'Rural'),
        supabase.from('zip_county_classifications').select('*', { count: 'exact', head: true }).eq('rural_urban', 'Urban'),
        supabase.from('contact_unlocks').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('credit_transactions').select('amount, transaction_type').gte('created_at', startOfMonth.toISOString()).in('transaction_type', ['unlock_contact', 'boost_profile'])
      ]);

      const totalRevenue = credits.data?.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0) || 0;
      const monthlyBoosts = credits.data?.filter(tx => tx.transaction_type === 'boost_profile').length || 0;

      setStats({
        vendors: vendors.count || 0,
        fieldReps: fieldReps.count || 0,
        coverageRequests: coverage.count || 0,
        communityPosts: posts.count || 0,
        flaggedPosts: flagged.count || 0,
        monthlyUnlocks: unlocks.count || 0,
        monthlyBoosts,
        totalRevenue,
        totalZips: zips.count || 0,
        ruralZips: rural.count || 0,
        urbanZips: urban.count || 0,
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

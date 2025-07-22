import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Star, 
  Coins, 
  Gift, 
  Target, 
  Award,
  ThumbsUp,
  MessageSquare,
  UserCheck,
  CreditCard,
  Trophy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DualBalance {
  repPoints: number;
  clearCredits: number;
  totalEarnedCredits: number;
}

interface DashboardStats {
  trustScore: number;
  communityScore: number;
  totalReviews: number;
  networkConnections: number;
  monthlyHelpfulVotes: number;
  monthlyTarget: number;
  communityRank: string;
  currentBalance: DualBalance;
}

const FieldRepDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    trustScore: 87,
    communityScore: 92,
    totalReviews: 23,
    networkConnections: 12,
    monthlyHelpfulVotes: 8,
    monthlyTarget: 10,
    communityRank: 'Silver',
    currentBalance: {
      repPoints: 47,
      clearCredits: 12,
      totalEarnedCredits: 156
    }
  });

  // Fetch user's dual balance from database
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: balanceData, error } = await supabase
          .from('user_balances')
          .select('rep_points, clear_credits, total_earned_credits')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching balance:', error);
          return;
        }

        if (balanceData) {
          setDashboardStats(prev => ({
            ...prev,
            currentBalance: {
              repPoints: balanceData.rep_points || 0,
              clearCredits: balanceData.clear_credits || 0,
              totalEarnedCredits: balanceData.total_earned_credits || 0
            }
          }));
        }
      } catch (error) {
        console.error('Error in fetchUserBalance:', error);
      }
    };

    fetchUserBalance();
  }, []);

  // Credit earning opportunities
  const creditOpportunities = [
    { action: 'Complete profile 100%', credits: 5, completed: false },
    { action: 'Leave vendor review', credits: 1, completed: dashboardStats.totalReviews > 0 },
    { action: 'Help community member', credits: 2, completed: false },
    { action: 'Post helpful content', credits: 3, completed: false },
    { action: 'Reach 80+ Trust Score', credits: 15, completed: dashboardStats.trustScore >= 80 },
    { action: 'Monthly active member (10+ votes)', credits: 5, completed: dashboardStats.monthlyHelpfulVotes >= 10 },
    { action: 'Reach Gold rank', credits: 20, completed: dashboardStats.communityRank === 'Gold' }
  ];

  // Community engagement metrics
  const communityMetrics = [
    { label: 'Helpful Votes Received', value: 47, icon: ThumbsUp },
    { label: 'Community Posts', value: 12, icon: MessageSquare },
    { label: 'Peer Endorsements', value: 8, icon: UserCheck },
    { label: 'Knowledge Sharing', value: 15, icon: Award }
  ];

  const handleViewGiveaways = () => {
    navigate('/giveaways');
    toast({
      title: "Giveaway Center",
      description: "View available giveaways and enter with your RepPoints!",
    });
  };

  const handleEarnRepPoints = () => {
    navigate('/community');
    toast({
      title: "Start Earning RepPoints!",
      description: "Engage with the community to earn RepPoints for giveaway entries.",
    });
  };

  const handleBuyCredits = () => {
    navigate('/credits/purchase');
    toast({
      title: "Purchase ClearCredits",
      description: "Buy ClearCredits to unlock premium features.",
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Analytics Coming Soon",
      description: "Detailed analytics dashboard is in development.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Dual Balance */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Field Rep Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and grow your network</p>
        </div>
        
        {/* Dual Balance Display */}
        <div className="flex gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">RepPoints</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {dashboardStats.currentBalance.repPoints}
              </div>
              <p className="text-xs text-blue-600">For giveaway entries</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">ClearCredits</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {dashboardStats.currentBalance.clearCredits}
              </div>
              <p className="text-xs text-green-600">For premium features</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Scores */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trust Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trust Score</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {dashboardStats.trustScore}/100
                  </Badge>
                </div>
                <Progress value={dashboardStats.trustScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on vendor reviews, job completions, and professional conduct
                </p>
              </div>

              {/* Community Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Community Score</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {dashboardStats.communityScore}/100
                  </Badge>
                </div>
                <Progress value={dashboardStats.communityScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on community engagement and helpful contributions
                </p>
              </div>

              {/* Community Rank */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Community Rank</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {dashboardStats.communityRank}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Community Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Community Engagement</CardTitle>
              <CardDescription>
                Your contributions to the ClearMarket community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {communityMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RepPoints & Opportunities Sidebar */}
        <div className="space-y-6">
          {/* RepPoints Earning Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                Earn RepPoints
              </CardTitle>
              <CardDescription>
                Complete these activities to earn RepPoints for giveaway entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {creditOpportunities.slice(0, 5).map((opportunity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{opportunity.action}</p>
                      <p className="text-xs text-muted-foreground">+{opportunity.credits} RepPoints</p>
                    </div>
                    <Badge variant={opportunity.completed ? "default" : "outline"}>
                      {opportunity.completed ? "✓" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Monthly Challenge */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Challenge</span>
                  <Badge variant="secondary" className="text-xs">
                    {dashboardStats.monthlyHelpfulVotes}/{dashboardStats.monthlyTarget} helpful votes
                  </Badge>
                </div>
                <Progress value={(dashboardStats.monthlyHelpfulVotes / dashboardStats.monthlyTarget) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Give {dashboardStats.monthlyTarget - dashboardStats.monthlyHelpfulVotes} more helpful votes this month for +5 RepPoints
                </p>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button variant="outline" className="w-full" onClick={handleViewAnalytics}>
                  View Detailed Analytics
                </Button>
                <Button className="w-full" onClick={handleEarnRepPoints}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Earn More RepPoints
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Giveaways & ClearCredits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                Giveaways & Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-lg border">
                <h4 className="font-medium text-purple-900 mb-2">Available Giveaways</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Use your RepPoints to enter monthly giveaways and vendor network contests!
                </p>
                <Button variant="outline" className="w-full" onClick={handleViewGiveaways}>
                  <Gift className="h-4 w-4 mr-2" />
                  View Giveaways
                </Button>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border">
                <h4 className="font-medium text-green-900 mb-2">Premium Features</h4>
                <p className="text-sm text-green-700 mb-3">
                  Buy ClearCredits to unlock contact info, boost your profile, and access premium opportunities.
                </p>
                <Button variant="outline" className="w-full" onClick={handleBuyCredits}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy ClearCredits
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FieldRepDashboard;

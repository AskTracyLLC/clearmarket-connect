import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CreditExplainerModal from '@/components/CreditExplainerModal';
import SendFieldRepNetworkAlert from '@/components/FieldRepDashboard/SendFieldRepNetworkAlert';
import { 
  MapPin, 
  Users, 
  BookmarkPlus, 
  Megaphone, 
  Star, 
  CreditCard,
  TrendingUp,
  MessageSquare,
  Calendar,
  Settings,
  Award,
  ThumbsUp,
  UserCheck,
  Coins
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const FieldRepDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [creditExplainerOpen, setCreditExplainerOpen] = useState(false);
  const [networkAlertOpen, setNetworkAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const dashboardStats = {
    networkedVendors: 8,
    coverageAreas: 3,
    totalReviews: 15,
    creditBalance: 12,
    profileComplete: 85,
    trustScore: 75,          // Based on vendor reviews
    communityScore: 68,      // Based on peer engagement
    helpfulPosts: 23,
    communityRank: 'Bronze',
    monthlyHelpfulVotes: 3,  // For monthly challenge tracking
    monthlyTarget: 5,        // Monthly challenge target
    responseRate: 89,        // For professional excellence tracking
    streakWeeks: 2          // Weekly response streak
  };

  // Credit earning activities with completion tracking
  const creditActivities = [
    { action: 'Complete profile (100%)', credits: 5, completed: dashboardStats.profileComplete === 100 },
    { action: 'First vendor review', credits: 10, completed: dashboardStats.totalReviews > 0 },
    { action: 'Help community member', credits: 2, completed: false },
    { action: 'Post helpful content', credits: 3, completed: false },
    { action: 'Reach 80+ Trust Score', credits: 15, completed: dashboardStats.trustScore >= 80 },
    { action: 'Monthly active member (5+ votes)', credits: 5, completed: dashboardStats.monthlyHelpfulVotes >= 5 },
    { action: 'Reach Bronze rank', credits: 5, completed: dashboardStats.communityRank === 'Bronze' }
  ];

  // Community engagement metrics
  const communityMetrics = [
    { label: 'Helpful Votes Received', value: 47, icon: ThumbsUp },
    { label: 'Community Posts', value: 12, icon: MessageSquare },
    { label: 'Peer Endorsements', value: 8, icon: UserCheck },
    { label: 'Knowledge Sharing', value: 15, icon: Award }
  ];

  // Handler functions for button interactions
  const handleViewAnalytics = () => {
    toast({
      title: "Analytics Coming Soon",
      description: "Detailed analytics dashboard is in development.",
    });
  };

  const handleFindVendors = () => {
    navigate('/vendor/search');
  };

  const handleMessageVendor = (vendorId) => {
    navigate(`/messages?recipient=${vendorId}`);
  };

  const handleApplyToOpportunity = async (opportunityId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Application Submitted!",
        description: "The vendor will be notified of your interest.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterOpportunities = () => {
    toast({
      title: "Filter Coming Soon",
      description: "Advanced filtering options are in development.",
    });
  };

  const handleNetworkAlert = () => {
    setNetworkAlertOpen(true);
  };

  const handleEarnCredits = () => {
    navigate('/community');
    toast({
      title: "Start Earning Credits!",
      description: "Engage with the community to boost your score and earn credits.",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getCommunityRankInfo = (score) => {
    if (score >= 80) return { next: 'Gold', credits: 20, current: 'Silver' };
    if (score >= 60) return { next: 'Silver', credits: 10, current: 'Bronze' };
    return { next: 'Bronze', credits: 5, current: 'Unranked' };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Field Rep Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Track your network connections, coverage opportunities, and performance metrics
                </p>
              </div>
              <Button size="lg" className="flex items-center gap-2 shrink-0" onClick={handleNetworkAlert}>
                <Megaphone className="h-5 w-5" />
                Network Alerts
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.networkedVendors}</div>
                <div className="text-xs text-muted-foreground">Network Vendors</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.coverageAreas}</div>
                <div className="text-xs text-muted-foreground">Coverage Areas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.totalReviews}</div>
                <div className="text-xs text-muted-foreground">Total Reviews</div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setCreditExplainerOpen(true)}>
              <CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.creditBalance}</div>
                <div className="text-xs text-muted-foreground">Credits</div>
                <Button variant="ghost" size="sm" className="text-xs h-auto p-1 mt-1">
                  How to earn?
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.profileComplete}%</div>
                <div className="text-xs text-muted-foreground">Profile Complete</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className="mb-2" variant={dashboardStats.trustScore >= 80 ? "default" : "secondary"}>
                  Trust Score
                </Badge>
                <div className="text-2xl font-bold">{dashboardStats.trustScore}</div>
                <div className="text-xs text-muted-foreground">Vendor Reviews</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Opportunities</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest network connections and opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">New vendor connection</p>
                          <p className="text-sm text-muted-foreground">Midwest Property Services</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Star className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Review received</p>
                          <p className="text-sm text-muted-foreground">5-star rating from Chicago vendor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Megaphone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Coverage opportunity</p>
                          <p className="text-sm text-muted-foreground">New area in Cook County</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Track your professional growth and community engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Profile Edit Button */}
                      <div className="pb-4 border-b">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => navigate('/fieldrep/profile')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Profile Completeness</span>
                          <span className="text-sm font-medium">{dashboardStats.profileComplete}%</span>
                        </div>
                        <Progress value={dashboardStats.profileComplete} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {dashboardStats.profileComplete === 100 ? 
                            "Complete! +5 credit bonus earned" : 
                            "Complete for +5 credit bonus"
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Trust Score</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getScoreColor(dashboardStats.trustScore)}`}>
                              {dashboardStats.trustScore}/100
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getScoreLabel(dashboardStats.trustScore)}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={dashboardStats.trustScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Based on vendor reviews • {dashboardStats.trustScore >= 80 ? 
                            "Milestone achieved! +15 credits earned" : 
                            `${80 - dashboardStats.trustScore} points to +15 credit milestone`
                          }
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Community Score</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getScoreColor(dashboardStats.communityScore)}`}>
                              {dashboardStats.communityScore}/100
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {dashboardStats.communityRank}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={dashboardStats.communityScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Based on peer engagement • Next rank: {getCommunityRankInfo(dashboardStats.communityScore).next} (+{getCommunityRankInfo(dashboardStats.communityScore).credits} credits)
                        </p>
                      </div>

                      {/* Monthly Challenge Progress */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Monthly Challenge</span>
                          <Badge variant="secondary" className="text-xs">
                            {dashboardStats.monthlyHelpfulVotes}/{dashboardStats.monthlyTarget} helpful votes
                          </Badge>
                        </div>
                        <Progress value={(dashboardStats.monthlyHelpfulVotes / dashboardStats.monthlyTarget) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Give {dashboardStats.monthlyTarget - dashboardStats.monthlyHelpfulVotes} more helpful votes this month for +5 credit bonus
                        </p>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <Button variant="outline" className="w-full" onClick={handleViewAnalytics}>
                          View Detailed Analytics
                        </Button>
                        <Button className="w-full" onClick={handleEarnCredits}>
                          <Coins className="h-4 w-4 mr-2" />
                          Earn More Credits
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Community Engagement Metrics */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Engagement</CardTitle>
                    <CardDescription>
                      Your contributions to the Field Rep community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      {communityMetrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                          <div key={index} className="text-center p-4 rounded-lg bg-muted/30">
                            <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <div className="text-xs text-muted-foreground">{metric.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Credit Earning Opportunities */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Earn Credits</CardTitle>
                    <CardDescription>
                      Complete these activities to earn credits and unlock premium features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {creditActivities.map((activity, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                          activity.completed ? 'bg-green-50 border-green-200' : 'bg-muted/30'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              activity.completed ? 'bg-green-500 text-white' : 'bg-muted'
                            }`}>
                              {activity.completed ? '✓' : '○'}
                            </div>
                            <span className="font-medium">{activity.action}</span>
                          </div>
                          <Badge variant={activity.completed ? "default" : "secondary"}>
                            +{activity.credits} credits
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="network">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Connections</CardTitle>
                    <CardDescription>
                      Your newest vendor connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1,2,3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Vendor Name {i}</p>
                              <p className="text-sm text-muted-foreground">Connected 2 days ago</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleMessageVendor(i)}>
                            Message
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Network Growth</CardTitle>
                    <CardDescription>
                      Expand your professional network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>This Month</span>
                        <span className="font-semibold">3 new connections</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Rate</span>
                        <span className="font-semibold">{dashboardStats.responseRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Streak</span>
                        <span className="font-semibold">{dashboardStats.streakWeeks} weeks</span>
                      </div>
                      <Button className="w-full" onClick={handleFindVendors}>
                        Find New Vendors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="opportunities">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Available Opportunities</h3>
                  <Button variant="outline" onClick={handleFilterOpportunities}>
                    Filter
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {[1,2,3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold mb-2">Property Coverage - Chicago Area</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Seeking reliable field rep for property inspections and vendor coordination
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="secondary">Chicago</Badge>
                              <Badge variant="outline">$50/visit</Badge>
                              <Badge variant="outline">2 credits required</Badge>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleApplyToOpportunity(i)}
                            disabled={isLoading || dashboardStats.creditBalance < 2}
                          >
                            {isLoading ? 'Applying...' : dashboardStats.creditBalance < 2 ? 'Need 2 Credits' : 'Apply'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Feedback</CardTitle>
                  <CardDescription>
                    Track your reviews and ratings from vendor partners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete your first job to start receiving vendor feedback and building your reputation.
                      </p>
                      <Button onClick={handleFindVendors}>
                        Find Opportunities
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Customize your dashboard preferences and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                      <p className="text-muted-foreground mb-4">
                        Notification preferences and dashboard customization options are in development.
                      </p>
                      <Button variant="outline" onClick={() => navigate('/settings')}>
                        Go to Profile Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <CreditExplainerModal 
        open={creditExplainerOpen} 
        onOpenChange={setCreditExplainerOpen} 
      />
      
      <SendFieldRepNetworkAlert 
        open={networkAlertOpen}
        onOpenChange={setNetworkAlertOpen}
        networkSize={dashboardStats.networkedVendors}
      />
      
      <Footer />
    </div>
  );
};

export default FieldRepDashboard;
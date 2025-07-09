import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CreditExplainerModal from '@/components/CreditExplainerModal';
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
  Settings
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const FieldRepDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [creditExplainerOpen, setCreditExplainerOpen] = useState(false);

  const dashboardStats = {
    networkedVendors: 8,
    coverageAreas: 3,
    totalReviews: 15,
    creditBalance: 12,
    profileComplete: 85,
    trustScore: 75
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Field Rep Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your network connections, coverage opportunities, and performance metrics
            </p>
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
                <div className="text-xs text-muted-foreground">Trust Rating</div>
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
                      Track your growth and engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Profile Completeness</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${dashboardStats.profileComplete}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{dashboardStats.profileComplete}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trust Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${dashboardStats.trustScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{dashboardStats.trustScore}/100</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full">
                          View Detailed Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="network">
              <Card>
                <CardHeader>
                  <CardTitle>Your Vendor Network</CardTitle>
                  <CardDescription>
                    Manage your connections with vendors in your coverage areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Network management features coming soon. Connect with vendors to unlock contact information and build your professional network.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities">
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Opportunities</CardTitle>
                  <CardDescription>
                    Find new areas and vendors looking for field rep coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Opportunity matching features coming soon. We'll help you discover vendors seeking coverage in your areas.
                  </p>
                </CardContent>
              </Card>
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
                  <p className="text-muted-foreground">
                    Review management features coming soon. View and respond to feedback from your vendor network.
                  </p>
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
                  <p className="text-muted-foreground">
                    Settings and preferences coming soon. Customize your dashboard experience.
                  </p>
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
      
      <Footer />
    </div>
  );
};

export default FieldRepDashboard;
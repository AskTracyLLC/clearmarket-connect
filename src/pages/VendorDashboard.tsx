import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Users, 
  BookmarkPlus, 
  Megaphone, 
  Star, 
  CreditCard,
  Map,
  Search,
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VendorCoverageMap from '@/components/VendorDashboard/VendorCoverageMap';
import VendorNetwork from '@/components/VendorDashboard/VendorNetwork';
import SavedSearches from '@/components/VendorDashboard/SavedSearches';
import CoverageRequests from '@/components/VendorDashboard/CoverageRequests';
import VendorReviews from '@/components/VendorDashboard/VendorReviews';
import AccountBilling from '@/components/VendorDashboard/AccountBilling';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('coverage');

  const dashboardStats = {
    connectedReps: 12,
    statesWithCoverage: 8,
    savedSearches: 5,
    activeCoverageRequests: 3,
    totalReviews: 24,
    creditBalance: 15
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Vendor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your Field Rep network, coverage areas, and business operations
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.connectedReps}</div>
                <div className="text-xs text-muted-foreground">Connected Reps</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Map className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.statesWithCoverage}</div>
                <div className="text-xs text-muted-foreground">States Covered</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <BookmarkPlus className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.savedSearches}</div>
                <div className="text-xs text-muted-foreground">Saved Searches</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Megaphone className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.activeCoverageRequests}</div>
                <div className="text-xs text-muted-foreground">Active Requests</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.totalReviews}</div>
                <div className="text-xs text-muted-foreground">Total Reviews</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{dashboardStats.creditBalance}</div>
                <div className="text-xs text-muted-foreground">Credits</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="coverage" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Coverage</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger value="searches" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Searches</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coverage">
              <VendorCoverageMap />
            </TabsContent>

            <TabsContent value="network">
              <VendorNetwork />
            </TabsContent>

            <TabsContent value="searches">
              <SavedSearches />
            </TabsContent>

            <TabsContent value="requests">
              <CoverageRequests />
            </TabsContent>

            <TabsContent value="reviews">
              <VendorReviews />
            </TabsContent>

            <TabsContent value="billing">
              <AccountBilling />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorDashboard;
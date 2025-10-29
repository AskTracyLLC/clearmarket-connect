import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ZipCountyImportTool } from "@/components/admin/ZipCountyImportTool";
import { CreditEarningSystem } from "@/components/admin/CreditEarningSystem";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { CreditOverrides } from "@/components/admin/CreditOverrides";
import { UserActivityLog } from "@/components/admin/UserActivityLog";
import { ConnectionLimitManager } from "@/components/admin/ConnectionLimitManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Database, Settings, Coins, Mail, Calendar, Network, BarChart3, Wrench, MessageSquare } from "lucide-react";
import { AIDiscussionCreator } from "@/components/admin/AIDiscussionCreator";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    // SECURITY: Removed development mode bypass for proper authorization

    const checkAdminAccess = async () => {
      console.log('🔍 AdminDashboard - Starting admin access check for user:', user?.id, user?.email);
      
      if (!user) {
        console.log('❌ AdminDashboard - No user found, redirecting to auth');
        navigate("/auth");
        return;
      }

      try {
        console.log('🔍 AdminDashboard - Querying user role from database...');
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        console.log('🔍 AdminDashboard - Database query result:', { data, error });

        if (error) {
          console.error('❌ AdminDashboard - Database error:', error);
          throw error;
        }

        if (data?.role !== "admin") {
          console.log('❌ AdminDashboard - User role is not admin:', data?.role);
          navigate("/");
          return;
        }

        console.log('✅ AdminDashboard - User confirmed as admin');
        setUserRole(data.role);
      } catch (error) {
        console.error("❌ AdminDashboard - Error checking admin access:", error);
        navigate("/");
      } finally {
        console.log('🔄 AdminDashboard - Setting loading to false');
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (userRole !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor platform activity, manage users, and configure system settings
          </p>
        </div>

        {/* Dashboard Layout with Quick Actions on Left */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Actions - Left Side */}
          <div className="lg:col-span-1">
            <AdminQuickActions onTabChange={setActiveTab} />
          </div>
          
          {/* Main Content - Right Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Platform Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
              <AdminStatsCards />
            </div>
            
            {/* Admin Alert */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You have administrator privileges. Use these tools carefully as changes affect the entire platform.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Content & Community
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users & Access
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              System & Data
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics & Reports
            </TabsTrigger>
          </TabsList>

          {/* Content & Community Section */}
          <TabsContent value="content" className="mt-6">
            <Tabs defaultValue="moderation" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="moderation" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Content Moderation
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Discussion Scheduler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="moderation">
                <ContentModeration />
              </TabsContent>

              <TabsContent value="discussions">
                <AIDiscussionCreator />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Users & Access Section */}
          <TabsContent value="users" className="mt-6">
            <Tabs defaultValue="management" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="management" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </TabsTrigger>
                <TabsTrigger value="limits" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Connection Limits
                </TabsTrigger>
              </TabsList>

              <TabsContent value="management">
                <UserManagement />
              </TabsContent>

              <TabsContent value="limits">
                <ConnectionLimitManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Financial Section */}
          <TabsContent value="financial" className="mt-6">
            <div className="space-y-6">
              <CreditOverrides />
              <CreditEarningSystem />
            </div>
          </TabsContent>

          {/* System & Data Section */}
          <TabsContent value="system" className="mt-6">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </TabsTrigger>
                <TabsTrigger value="zip-county" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  ZIP/County Data
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings">
                <SystemSettings />
              </TabsContent>

              <TabsContent value="zip-county">
                <ZipCountyImportTool />
              </TabsContent>

              <TabsContent value="email">
                <EmailTemplateManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Analytics & Reports Section */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <UserActivityLog />
              <Card>
                <CardHeader>
                  <CardTitle>Additional Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Additional analytics and reporting dashboards will be available here in future updates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

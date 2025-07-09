import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ZipCountyImportTool } from "@/components/admin/ZipCountyImportTool";
import { CreditEarningSystem } from "@/components/admin/CreditEarningSystem";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { UserManagement } from "@/components/admin/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Database, Settings, Coins } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data?.role !== "admin") {
          navigate("/");
          return;
        }

        setUserRole(data.role);
      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate("/");
      } finally {
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
            <AdminQuickActions />
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

        <Tabs defaultValue="zip-county" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="zip-county" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              ZIP/County Data
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Credit System
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zip-county" className="mt-6">
            <ZipCountyImportTool />
          </TabsContent>

          <TabsContent value="credits" className="mt-6">
            <CreditEarningSystem />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  System configuration options will be available here in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics and reporting dashboards will be available here in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
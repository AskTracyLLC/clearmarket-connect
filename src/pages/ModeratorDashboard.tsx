import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ModeratorStatsCards } from "@/components/moderator/ModeratorStatsCards";
import { ModeratorQuickActions } from "@/components/moderator/ModeratorQuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, MessageSquare, Flag, Search, ClipboardList } from "lucide-react";

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkModeratorAccess = async () => {
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

        if (data?.role !== "moderator" && data?.role !== "admin") {
          navigate("/");
          return;
        }

        setUserRole(data.role);
      } catch (error) {
        console.error("Error checking moderator access:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkModeratorAccess();
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

  if (userRole !== "moderator" && userRole !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor community activity, review flagged content, and resolve disputes
          </p>
        </div>

        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Community Overview</h2>
          <ModeratorStatsCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You have moderator privileges for community oversight. Focus on maintaining a safe and constructive environment.
              </AlertDescription>
            </Alert>
          </div>
          <div className="lg:col-span-1">
            <ModeratorQuickActions />
          </div>
        </div>

        <Tabs defaultValue="flagged-posts" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="flagged-posts" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Flagged Posts
            </TabsTrigger>
            <TabsTrigger value="flagged-comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="review-disputes" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="action-log" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Action Log
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged-posts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Community Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Flagged posts management will be available here in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged-comments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Flagged comments management will be available here in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review-disputes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Review dispute resolution tools will be available here in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="action-log" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderator Action Log</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Moderation action history will be available here in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User search and investigation tools will be available here in future updates.
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

export default ModeratorDashboard;
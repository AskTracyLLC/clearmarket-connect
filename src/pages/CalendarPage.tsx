import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OptimizedCalendarView from "@/components/calendar/OptimizedCalendarView";
import AutoReplySettings from "@/components/calendar/AutoReplySettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Network, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CalendarPage = () => {
  const [userRole, setUserRole] = useState<"field_rep" | "vendor">("field_rep");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (user) {
          const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app'];
          if (adminEmails.includes(user.email || '')) {
            setUserRole("field_rep");
            return;
          }
          
          const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              setUserRole("field_rep");
              return;
            }
            throw error;
          }
          
          setUserRole(userData.role as "field_rep" | "vendor");
        } else {
          setUserRole("field_rep");
        }
      } catch (error: any) {
        setUserRole("field_rep");
        toast({
          title: "Error loading user data",
          description: "Using default settings. " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Calendar &amp; Alerts</h1>
            <p className="text-muted-foreground">
              Manage your availability, send network alerts, and configure auto-replies.
            </p>
          </div>

          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Network Events
              </TabsTrigger>
              <TabsTrigger value="auto-reply" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Auto-Reply
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Message History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <OptimizedCalendarView userRole={userRole} />
            </TabsContent>

            <TabsContent value="network">
              <OptimizedCalendarView userRole={userRole} />
            </TabsContent>

            <TabsContent value="auto-reply">
              <AutoReplySettings />
            </TabsContent>

            <TabsContent value="history">
              <MessageHistoryView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Message History Component
const MessageHistoryView = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Network Message History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Your network message history will appear here. This feature shows all bulk messages you've sent to your vendor network.
        </p>
        {/* TODO: Implement message history list */}
      </CardContent>
    </Card>
  );
};

export default CalendarPage;

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FeedbackBoardNew } from "@/components/FeedbackBoardNew";
import { PlatformWorkTypeRequests } from "@/components/admin/PlatformWorkTypeRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SupportPage = () => {
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (!user?.id) return;
    
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    };
    
    checkAdminStatus();
  }, [user?.id]);

  useEffect(() => {
    fetchCounts();

    // Real-time subscriptions
    const feedbackChannel = supabase
      .channel('feedback_posts_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_posts' }, fetchCounts)
      .subscribe();

    const requestsChannel = supabase
      .channel('requests_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_worktype_requests' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, []);

  const fetchCounts = async () => {
    const [feedbackResult, requestsResult] = await Promise.all([
      supabase.from('feedback_posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('platform_worktype_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    setFeedbackCount(feedbackResult.count || 0);
    setRequestsCount(requestsResult.count || 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Platform Support & Known Issues</h1>
            <p className="text-muted-foreground">
              Transparency hub for all reported issues, feature requests, and platform updates. 
              Track what we're working on and share your feedback.
            </p>
          </div>
          
          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="feedback" className="gap-2">
                Feedback & Issues
                {isAdmin && feedbackCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {feedbackCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                Platform/Inspection Requests
                {isAdmin && requestsCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {requestsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="feedback">
              <FeedbackBoardNew />
            </TabsContent>
            
            <TabsContent value="requests">
              <PlatformWorkTypeRequests />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;

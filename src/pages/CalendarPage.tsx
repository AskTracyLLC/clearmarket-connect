import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalendarView from "@/components/calendar/CalendarView";
import AutoReplySettings from "@/components/calendar/AutoReplySettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Network, History } from "lucide-react";

const CalendarPage = () => {
  // For demo purposes, assume field_rep role. In real app, get from auth/context
  const userRole: "field_rep" | "vendor" = "field_rep";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Calendar & Alerts</h1>
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
              <CalendarView userRole={userRole} />
            </TabsContent>

            <TabsContent value="network">
              <CalendarView userRole={userRole} showNetworkEvents={true} />
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
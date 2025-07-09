import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import UpcomingEventsList from "./UpcomingEventsList";
import CalendarLegend from "./CalendarLegend";

interface CalendarEvent {
  id: string;
  event_type: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string | null;
  event_visibility: string;
  user_id: string;
  users?: { display_name: string | null; role?: string };
}

interface NetworkEvent extends CalendarEvent {
  owner_name: string;
  owner_role: "field_rep" | "vendor";
}

interface OptimizedCalendarViewProps {
  userRole: "field_rep" | "vendor";
}

const OptimizedCalendarView = ({ userRole }: OptimizedCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [showNetworkEvents, setShowNetworkEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load user's own events
      const { data: userEvents, error: userError } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_date", { ascending: true });

      if (userError) throw userError;
      setEvents(userEvents || []);

      // Load network events from connected users
      if (showNetworkEvents) {
        const { data: networkEventsData, error: networkError } = await supabase
          .from("calendar_events")
          .select(`
            *,
            users!calendar_events_user_id_fkey(display_name, role)
          `)
          .eq("event_visibility", "network")
          .neq("user_id", (await supabase.auth.getUser()).data.user?.id);

        if (networkError) throw networkError;
        
        // Transform network events with owner info
        const transformedNetworkEvents: NetworkEvent[] = (networkEventsData || []).map(event => ({
          ...event,
          owner_name: event.users?.display_name || "Unknown User",
          owner_role: (event.users?.role === "vendor" ? "vendor" : "field_rep") as "field_rep" | "vendor"
        }));

        // Filter events based on user role preferences
        const filteredEvents = transformedNetworkEvents.filter(event => {
          if (userRole === "field_rep") {
            // Field reps see vendor events (pay dates, office closures)
            return event.owner_role === "vendor" && ["pay_date", "office_closure"].includes(event.event_type);
          } else {
            // Vendors see field rep events (unavailable dates)
            return event.owner_role === "field_rep" && event.event_type === "unavailable";
          }
        });

        setNetworkEvents(filteredEvents);
      } else {
        setNetworkEvents([]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading calendar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [showNetworkEvents, userRole]);

  const handleEventClick = (event: CalendarEvent | NetworkEvent, date: Date) => {
    setSelectedDate(date);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <CalendarHeader
          userRole={userRole}
          showNetworkEvents={showNetworkEvents}
          onShowNetworkEventsChange={setShowNetworkEvents}
          onEventCreated={loadEvents}
        />

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'}`}>
          {/* Calendar Grid */}
          <div className={`${isMobile ? 'order-2' : 'lg:col-span-2'}`}>
            <CalendarGrid
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={events}
              networkEvents={networkEvents}
              showNetworkEvents={showNetworkEvents}
            />
          </div>

          {/* Upcoming Events List */}
          <div className={`${isMobile ? 'order-1' : 'lg:col-span-3'}`}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              <p className="text-sm text-muted-foreground">
                Click an event to highlight its date on the calendar
              </p>
            </div>
            
            <UpcomingEventsList
              events={events}
              networkEvents={networkEvents}
              showNetworkEvents={showNetworkEvents}
              loading={loading}
              selectedDate={selectedDate}
              onEventClick={handleEventClick}
            />
          </div>
        </div>

        <CalendarLegend />
      </CardContent>
    </Card>
  );
};

export default OptimizedCalendarView;
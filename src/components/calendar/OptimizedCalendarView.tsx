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
      console.log('🔍 OptimizedCalendarView: Starting to load events...');
      setLoading(true);
      
      // Load user's own events
      console.log('📅 Loading user events...');
      const { data: userEvents, error: userError } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_date", { ascending: true });

      if (userError) {
        console.error('❌ Error loading user events:', userError);
        throw userError;
      }
      
      console.log('✅ User events loaded:', userEvents?.length || 0);
      setEvents(userEvents || []);

      // Load network events from connected users
      if (showNetworkEvents) {
        console.log('🌐 Loading network events...');
        const currentUser = await supabase.auth.getUser();
        
        if (!currentUser.data.user) {
          console.warn('⚠️ No authenticated user found for network events');
          setNetworkEvents([]);
          return;
        }

        const { data: networkEventsData, error: networkError } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("event_visibility", "network")
          .neq("user_id", currentUser.data.user.id);

        if (networkError) {
          console.error('❌ Error loading network events:', networkError);
          throw networkError;
        }
        
        console.log('✅ Network events loaded:', networkEventsData?.length || 0);
        
        // Get user data for event owners
        const ownerIds = networkEventsData?.map(event => event.user_id) || [];
        let ownersData = [];
        
        if (ownerIds.length > 0) {
          console.log('👥 Loading owner data for', ownerIds.length, 'users...');
          const { data: userData, error: userDataError } = await supabase
            .from("users")
            .select("id, display_name, anonymous_username, role")
            .in("id", ownerIds);
          
          if (userDataError) {
            console.error('❌ Error loading user data:', userDataError);
          } else {
            ownersData = userData || [];
            console.log('✅ Owner data loaded for', ownersData.length, 'users');
          }
        }

        // Transform network events with owner info
        const transformedNetworkEvents: NetworkEvent[] = (networkEventsData || []).map(event => {
          const owner = ownersData.find(o => o.id === event.user_id);
          return {
            ...event,
            owner_name: owner?.display_name || owner?.anonymous_username || "Unknown User",
            owner_role: (owner?.role === "vendor" ? "vendor" : "field_rep") as "field_rep" | "vendor"
          };
        });

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

        console.log('🔍 Filtered network events:', filteredEvents.length, 'for role:', userRole);
        setNetworkEvents(filteredEvents);
      } else {
        setNetworkEvents([]);
      }
    } catch (error: any) {
      console.error('❌ Calendar loading error:', error);
      toast({
        title: "Error loading calendar",
        description: error.message,
        variant: "destructive",
      });
      setEvents([]);
      setNetworkEvents([]);
    } finally {
      setLoading(false);
      console.log('🏁 Calendar loading complete');
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

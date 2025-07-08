import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Users, DollarSign, X, Send } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import CreateEventModal from "./CreateEventModal";
import BulkMessageModal from "./BulkMessageModal";

interface CalendarEvent {
  id: string;
  event_type: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  notify_network: boolean;
  user_id: string;
}

interface CalendarViewProps {
  userRole: "field_rep" | "vendor";
  showNetworkEvents?: boolean;
}

const CalendarView = ({ userRole, showNetworkEvents = false }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [networkEvents, setNetworkEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      // Load network events if requested
      if (showNetworkEvents) {
        const { data: networkEventsData, error: networkError } = await supabase
          .from("calendar_events")
          .select(`
            *,
            users!calendar_events_user_id_fkey(display_name)
          `)
          .eq("notify_network", true)
          .neq("user_id", (await supabase.auth.getUser()).data.user?.id);

        if (networkError) throw networkError;
        setNetworkEvents(networkEventsData || []);
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
  }, [showNetworkEvents]);

  const getEventsByDate = (date: Date) => {
    const allEvents = showNetworkEvents ? [...events, ...networkEvents] : events;
    return allEvents.filter(event => {
      const startDate = parseISO(event.start_date);
      const endDate = parseISO(event.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "unavailable":
        return <X className="h-3 w-3" />;
      case "office_closure":
        return <CalendarIcon className="h-3 w-3" />;
      case "pay_date":
        return <DollarSign className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "unavailable":
        return "destructive";
      case "office_closure":
        return "secondary";
      case "pay_date":
        return "default";
      default:
        return "outline";
    }
  };

  const selectedDateEvents = selectedDate ? getEventsByDate(selectedDate) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {userRole === "field_rep" ? "My Availability" : "Office Calendar"}
          </CardTitle>
          <div className="flex gap-2">
            {userRole === "field_rep" && (
              <BulkMessageModal
                trigger={
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Network Alert
                  </Button>
                }
              />
            )}
            <CreateEventModal
              userRole={userRole}
              onEventCreated={loadEvents}
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => getEventsByDate(date).length > 0,
                unavailable: (date) => getEventsByDate(date).some(e => e.event_type === "unavailable"),
                closure: (date) => getEventsByDate(date).some(e => e.event_type === "office_closure"),
                payDate: (date) => getEventsByDate(date).some(e => e.event_type === "pay_date"),
              }}
              modifiersStyles={{
                hasEvents: { fontWeight: "bold" },
                unavailable: { backgroundColor: "hsl(var(--destructive))", color: "white" },
                closure: { backgroundColor: "hsl(var(--secondary))" },
                payDate: { backgroundColor: "hsl(var(--primary))", color: "white" },
              }}
            />
          </div>

          {/* Events for selected date */}
          <div>
            <h3 className="font-semibold mb-4">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <Card key={event.id} className="p-3">
                    <div className="flex items-start gap-2">
                      {getEventTypeIcon(event.event_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getEventTypeColor(event.event_type)} className="text-xs">
                            {event.event_type.replace("_", " ")}
                          </Badge>
                          {event.notify_network && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              Network
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No events scheduled for this date.
              </p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Legend:</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded" />
              <span>Office Closure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Pay Date</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
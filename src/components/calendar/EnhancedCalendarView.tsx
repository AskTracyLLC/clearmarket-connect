import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Calendar as CalendarIcon, Users, DollarSign, X, Send, Eye, EyeOff } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import EnhancedCreateEventModal from "./EnhancedCreateEventModal";
import BulkMessageModal from "./BulkMessageModal";

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

interface EnhancedCalendarViewProps {
  userRole: "field_rep" | "vendor";
}

const EnhancedCalendarView = ({ userRole }: EnhancedCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [showNetworkEvents, setShowNetworkEvents] = useState(false);
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

      // Load network events from connected users
      if (showNetworkEvents) {
        const { data: networkEventsData, error: networkError } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("event_visibility", "network")
          .neq("user_id", (await supabase.auth.getUser()).data.user?.id);

        if (networkError) throw networkError;
        
        // Get user data for event owners
        const ownerIds = networkEventsData?.map(event => event.user_id) || [];
        let ownersData = [];
        
        if (ownerIds.length > 0) {
          const { data: userData } = await supabase
            .from("users")
            .select("id, display_name, anonymous_username, role")
            .in("id", ownerIds);
          ownersData = userData || [];
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

  const getEventsByDate = (date: Date) => {
    return events.filter(event => {
      const startDate = parseISO(event.start_date);
      const endDate = parseISO(event.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getNetworkEventsByDate = (date: Date) => {
    return networkEvents.filter(event => {
      const startDate = parseISO(event.start_date);
      const endDate = parseISO(event.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getAllEventsByDate = (date: Date) => {
    const userEvents = getEventsByDate(date);
    const netEvents = showNetworkEvents ? getNetworkEventsByDate(date) : [];
    return [...userEvents, ...netEvents];
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
  const selectedDateNetworkEvents = selectedDate && showNetworkEvents ? getNetworkEventsByDate(selectedDate) : [];

  // Get upcoming network events for sidebar (next 30 days)
  const upcomingNetworkEvents = networkEvents
    .filter(event => {
      const eventDate = parseISO(event.start_date);
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 10); // Limit to 10 events

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
            <EnhancedCreateEventModal
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
        
        {/* Network Events Toggle */}
        <div className="flex items-center space-x-2 pt-4">
          <Switch
            id="show-network"
            checked={showNetworkEvents}
            onCheckedChange={setShowNetworkEvents}
          />
          <Label htmlFor="show-network" className="flex items-center gap-2">
            {showNetworkEvents ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Show Events from My Network
          </Label>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className={cn("lg:col-span-3", showNetworkEvents && "lg:col-span-2")}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => getAllEventsByDate(date).length > 0,
                unavailable: (date) => getAllEventsByDate(date).some(e => e.event_type === "unavailable"),
                closure: (date) => getAllEventsByDate(date).some(e => e.event_type === "office_closure"),
                payDate: (date) => getAllEventsByDate(date).some(e => e.event_type === "pay_date"),
              }}
              modifiersStyles={{
                hasEvents: { fontWeight: "bold" },
                unavailable: { backgroundColor: "hsl(var(--destructive))", color: "white" },
                closure: { backgroundColor: "hsl(var(--secondary))" },
                payDate: { backgroundColor: "hsl(var(--primary))", color: "white" },
              }}
            />
          </div>

          {/* Network Events Sidebar */}
          {showNetworkEvents && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Network Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-64">
                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    ) : upcomingNetworkEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingNetworkEvents.map((event) => (
                          <div key={event.id} className="p-2 border rounded-sm hover:bg-muted/50 cursor-pointer">
                            <div className="flex items-start gap-2">
                              {getEventTypeIcon(event.event_type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{format(parseISO(event.start_date), "MMM d")}</p>
                                <p className="text-xs text-muted-foreground truncate">{event.owner_name}</p>
                                <Badge variant={getEventTypeColor(event.event_type)} className="text-xs mt-1">
                                  {event.event_type.replace("_", " ")}
                                </Badge>
                                {event.description && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No upcoming network events.
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Events for selected date */}
          <div className={cn("lg:col-span-1", showNetworkEvents && "lg:col-span-2")}>
            <h3 className="font-semibold mb-4">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (selectedDateEvents.length > 0 || selectedDateNetworkEvents.length > 0) ? (
              <div className="space-y-3">
                {/* User's own events */}
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
                          {event.event_visibility === "network" && (
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

                {/* Network events for selected date */}
                {selectedDateNetworkEvents.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-xs font-medium text-muted-foreground mb-2">Network Events</p>
                    {selectedDateNetworkEvents.map((event) => (
                      <Card key={event.id} className="p-3 bg-muted/30">
                        <div className="flex items-start gap-2">
                          {getEventTypeIcon(event.event_type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.owner_name}</p>
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                            <Badge variant={getEventTypeColor(event.event_type)} className="text-xs mt-2">
                              {event.event_type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
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

export default EnhancedCalendarView;

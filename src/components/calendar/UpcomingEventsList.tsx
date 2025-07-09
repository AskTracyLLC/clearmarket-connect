import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, DollarSign, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface UpcomingEventsListProps {
  events: CalendarEvent[];
  networkEvents: NetworkEvent[];
  showNetworkEvents: boolean;
  loading: boolean;
  selectedDate?: Date;
  onEventClick?: (event: CalendarEvent | NetworkEvent, date: Date) => void;
}

const UpcomingEventsList = ({
  events,
  networkEvents,
  showNetworkEvents,
  loading,
  selectedDate,
  onEventClick,
}: UpcomingEventsListProps) => {
  
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "unavailable":
        return <X className="h-4 w-4" />;
      case "office_closure":
        return <CalendarIcon className="h-4 w-4" />;
      case "pay_date":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
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

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  // Combine and sort all events by date
  type EventWithFlag = (CalendarEvent | NetworkEvent) & { isNetworkEvent: boolean };
  
  const allEvents: EventWithFlag[] = [
    ...events.map(e => ({ ...e, isNetworkEvent: false as const })),
    ...(showNetworkEvents ? networkEvents.map(e => ({ ...e, isNetworkEvent: true as const })) : [])
  ];

  // Group events by date
  const groupedEvents = allEvents.reduce((groups, event) => {
    const dateKey = format(parseISO(event.start_date), "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, typeof allEvents>);

  // Sort dates and limit to next 30 days
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const sortedDates = Object.keys(groupedEvents)
    .filter(dateKey => {
      const date = parseISO(dateKey);
      return date >= today && date <= thirtyDaysFromNow;
    })
    .sort()
    .slice(0, 15); // Limit to 15 dates

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {sortedDates.map((dateKey) => {
          const events = groupedEvents[dateKey];
          const eventDate = parseISO(dateKey);
          const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey;
          
          return (
            <div key={dateKey} className={cn(
              "border rounded-lg p-3 transition-colors",
              isSelected && "border-primary bg-primary/5"
            )}>
              <h4 className="font-medium text-sm mb-2 text-primary">
                {formatEventDate(dateKey)} • {format(eventDate, "EEEE")}
              </h4>
              
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors",
                      event.isNetworkEvent && "bg-muted/30"
                    )}
                    onClick={() => onEventClick?.(event, eventDate)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      
                      {event.isNetworkEvent && 'owner_name' in event && (
                        <p className="text-xs text-muted-foreground truncate">
                          by {(event as any).owner_name}
                        </p>
                      )}
                      
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getEventTypeColor(event.event_type)} className="text-xs">
                          {event.event_type.replace("_", " ")}
                        </Badge>
                        
                        {event.event_visibility === "network" && !event.isNetworkEvent && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Network
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default UpcomingEventsList;
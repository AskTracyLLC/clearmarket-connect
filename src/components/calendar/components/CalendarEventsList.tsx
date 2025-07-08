import { format } from "date-fns";
import EventCard from "./EventCard";

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

interface CalendarEventsListProps {
  selectedDate: Date | undefined;
  events: CalendarEvent[];
  loading: boolean;
}

const CalendarEventsList = ({ selectedDate, events, loading }: CalendarEventsListProps) => {
  return (
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
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No events scheduled for this date.
        </p>
      )}
    </div>
  );
};

export default CalendarEventsList;
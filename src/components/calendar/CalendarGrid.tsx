import { Calendar } from "@/components/ui/calendar";
import { parseISO } from "date-fns";

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

interface CalendarGridProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  networkEvents: NetworkEvent[];
  showNetworkEvents: boolean;
}

const CalendarGrid = ({
  selectedDate,
  onSelectDate,
  events,
  networkEvents,
  showNetworkEvents,
}: CalendarGridProps) => {
  
  const getAllEventsByDate = (date: Date) => {
    const userEvents = events.filter(event => {
      const startDate = parseISO(event.start_date);
      const endDate = parseISO(event.end_date);
      return date >= startDate && date <= endDate;
    });
    
    const netEvents = showNetworkEvents ? networkEvents.filter(event => {
      const startDate = parseISO(event.start_date);
      const endDate = parseISO(event.end_date);
      return date >= startDate && date <= endDate;
    }) : [];
    
    return [...userEvents, ...netEvents];
  };

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        className="rounded-md border w-fit"
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
  );
};

export default CalendarGrid;
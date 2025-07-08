import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { getEventTypeIcon, getEventTypeColor } from "../utils/eventTypeUtils";

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

interface EventCardProps {
  event: CalendarEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const IconComponent = getEventTypeIcon(event.event_type);
  
  return (
    <Card className="p-3">
      <div className="flex items-start gap-2">
        <IconComponent className="h-3 w-3" />
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
  );
};

export default EventCard;
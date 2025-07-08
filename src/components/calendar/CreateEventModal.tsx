import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateDefaultTitle } from "./utils/eventTypeUtils";
import EventTypeSelector from "./components/EventTypeSelector";
import DateRangeSelector from "./components/DateRangeSelector";
import EventFormFields from "./components/EventFormFields";

interface CreateEventModalProps {
  trigger?: React.ReactNode;
  userRole: "field_rep" | "vendor";
  onEventCreated?: () => void;
}

const CreateEventModal = ({ trigger, userRole, onEventCreated }: CreateEventModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState<"unavailable" | "office_closure" | "pay_date">(
    userRole === "field_rep" ? "unavailable" : "office_closure"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notifyNetwork, setNotifyNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();


  const handleCreateEvent = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    const eventTitle = title.trim() || generateDefaultTitle(eventType);

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("calendar_events")
        .insert({
          user_id: user.id,
          event_type: eventType,
          title: eventTitle,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          description: description.trim() || null,
          notify_network: notifyNetwork
        });

      if (error) throw error;

      toast({
        title: "Event created!",
        description: `${eventTitle} has been added to your calendar.`,
      });

      setIsOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate(undefined);
      setEndDate(undefined);
      setNotifyNetwork(false);
      setEventType(userRole === "field_rep" ? "unavailable" : "office_closure");

      onEventCreated?.();

    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Calendar Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar and optionally notify your network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <EventTypeSelector
            userRole={userRole}
            value={eventType}
            onChange={(value: any) => setEventType(value)}
          />

          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          <EventFormFields
            title={title}
            description={description}
            notifyNetwork={notifyNetwork}
            eventType={eventType}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onNotifyNetworkChange={setNotifyNetwork}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateEvent} 
            disabled={loading || !startDate || !endDate}
          >
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
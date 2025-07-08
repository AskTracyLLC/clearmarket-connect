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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

  const getEventTypeOptions = () => {
    if (userRole === "field_rep") {
      return [
        { value: "unavailable", label: "Unavailable/Time Off", description: "Mark dates when you're not available for work" }
      ];
    } else {
      return [
        { value: "office_closure", label: "Office Closure", description: "Days when your office is closed" },
        { value: "pay_date", label: "Pay Date", description: "Payment processing days or pay periods" }
      ];
    }
  };

  const generateDefaultTitle = () => {
    switch (eventType) {
      case "unavailable":
        return "Unavailable";
      case "office_closure":
        return "Office Closed";
      case "pay_date":
        return "Pay Day";
      default:
        return "";
    }
  };

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

    const eventTitle = title.trim() || generateDefaultTitle();

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

  const eventTypeOptions = getEventTypeOptions();

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
          {/* Event Type */}
          {eventTypeOptions.length > 1 && (
            <div>
              <Label className="text-base font-medium">Event Type</Label>
              <RadioGroup value={eventType} onValueChange={(value: any) => setEventType(value)} className="mt-2">
                {eventTypeOptions.map((option) => (
                  <div key={option.value} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{option.description}</p>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={generateDefaultTitle()}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Notify Network */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-network">Notify Network</Label>
              <p className="text-xs text-muted-foreground">
                Make this event visible to your connected network
              </p>
            </div>
            <Switch
              id="notify-network"
              checked={notifyNetwork}
              onCheckedChange={setNotifyNetwork}
            />
          </div>
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
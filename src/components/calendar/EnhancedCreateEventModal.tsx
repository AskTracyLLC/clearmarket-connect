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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar as CalendarIcon, Eye, EyeOff, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EnhancedCreateEventModalProps {
  trigger?: React.ReactNode;
  userRole: "field_rep" | "vendor";
  onEventCreated?: () => void;
}

const EnhancedCreateEventModal = ({ trigger, userRole, onEventCreated }: EnhancedCreateEventModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState<"unavailable" | "office_closure" | "pay_date">(
    userRole === "field_rep" ? "unavailable" : "office_closure"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [eventVisibility, setEventVisibility] = useState<"private" | "network">("private");
  const [enableAutoReply, setEnableAutoReply] = useState(false);
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
          event_visibility: eventVisibility,
          notify_network: eventVisibility === "network" // Keep for backward compatibility
        });

      if (error) throw error;

      // If auto-reply is enabled for unavailable events, create/update auto-reply settings
      if (eventType === "unavailable" && enableAutoReply) {
        const autoReplyData = {
          user_id: user.id,
          enabled: true,
          active_from: startDate.toISOString().split("T")[0],
          active_until: endDate.toISOString().split("T")[0],
          message_template: `Hi! I'm currently unavailable and will return on ${format(endDate, "MM/dd")}. Please reach out again then.`
        };

        // Check if auto-reply settings already exist
        const { data: existingSettings } = await supabase
          .from("auto_reply_settings")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingSettings) {
          // Update existing settings
          const { error: autoReplyError } = await supabase
            .from("auto_reply_settings")
            .update(autoReplyData)
            .eq("id", existingSettings.id);

          if (autoReplyError) {
            console.warn("Failed to update auto-reply settings:", autoReplyError);
          }
        } else {
          // Create new settings
          const { error: autoReplyError } = await supabase
            .from("auto_reply_settings")
            .insert(autoReplyData);

          if (autoReplyError) {
            console.warn("Failed to create auto-reply settings:", autoReplyError);
          }
        }
      }

      toast({
        title: "Event created!",
        description: `${eventTitle} has been added to your calendar.${enableAutoReply && eventType === "unavailable" ? " Auto-reply has been enabled." : ""}`,
      });

      setIsOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate(undefined);
      setEndDate(undefined);
      setEventVisibility("private");
      setEnableAutoReply(false);
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
            Add a new event to your calendar with optional network visibility.
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

          {/* Auto-Reply for Unavailable Events */}
          {eventType === "unavailable" && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-reply" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Enable Auto-Reply
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond to messages during this unavailable period
                  </p>
                </div>
                <Switch
                  id="auto-reply"
                  checked={enableAutoReply}
                  onCheckedChange={setEnableAutoReply}
                />
              </div>
              {enableAutoReply && (
                <div className="mt-3 p-3 border rounded bg-background/50">
                  <p className="text-sm text-muted-foreground">
                    Auto-reply will be enabled from {startDate ? format(startDate, "PPP") : "start date"} to {endDate ? format(endDate, "PPP") : "end date"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Event Visibility */}
          <div>
            <Label className="text-base font-medium">Event Visibility</Label>
            <RadioGroup value={eventVisibility} onValueChange={(value: any) => setEventVisibility(value)} className="mt-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Private
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">Only visible to you</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="network" id="network" />
                  <Label htmlFor="network" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Network
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Visible to your connected network members
                </p>
              </div>
            </RadioGroup>
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

export default EnhancedCreateEventModal;
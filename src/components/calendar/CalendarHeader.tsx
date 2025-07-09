import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Calendar as CalendarIcon, Send, Eye, EyeOff } from "lucide-react";
import BulkMessageModal from "./BulkMessageModal";
import EnhancedCreateEventModal from "./EnhancedCreateEventModal";

interface CalendarHeaderProps {
  userRole: "field_rep" | "vendor";
  showNetworkEvents: boolean;
  onShowNetworkEventsChange: (show: boolean) => void;
  onEventCreated: () => void;
}

const CalendarHeader = ({
  userRole,
  showNetworkEvents,
  onShowNetworkEventsChange,
  onEventCreated,
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          {userRole === "field_rep" ? "My Availability" : "Office Calendar"}
        </h1>
        
        {/* Network Events Toggle */}
        <div className="flex items-center space-x-2 mt-3">
          <Switch
            id="show-network"
            checked={showNetworkEvents}
            onCheckedChange={onShowNetworkEventsChange}
          />
          <Label htmlFor="show-network" className="flex items-center gap-2 text-sm">
            {showNetworkEvents ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Show Network Events
          </Label>
        </div>
      </div>

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
          onEventCreated={onEventCreated}
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default CalendarHeader;
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Calendar as CalendarIcon, Megaphone, Eye, EyeOff } from "lucide-react";
import SendFieldRepNetworkAlert from "@/components/FieldRepDashboard/SendFieldRepNetworkAlert";
import EnhancedCreateEventModal from "./EnhancedCreateEventModal";
import { useState } from "react";

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
  const [networkAlertOpen, setNetworkAlertOpen] = useState(false);

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
          <Button size="lg" className="flex items-center gap-2 shrink-0" onClick={() => setNetworkAlertOpen(true)}>
            <Megaphone className="h-5 w-5" />
            Network Alerts
          </Button>
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

      {/* Network Alert Modal */}
      {userRole === "field_rep" && (
        <SendFieldRepNetworkAlert
          open={networkAlertOpen}
          onOpenChange={setNetworkAlertOpen}
          networkSize={0} // TODO: Get actual network size
        />
      )}
    </div>
  );
};

export default CalendarHeader;
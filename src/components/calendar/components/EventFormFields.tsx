import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { generateDefaultTitle } from "../utils/eventTypeUtils";

interface EventFormFieldsProps {
  title: string;
  description: string;
  notifyNetwork: boolean;
  eventType: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onNotifyNetworkChange: (value: boolean) => void;
}

const EventFormFields = ({
  title,
  description,
  notifyNetwork,
  eventType,
  onTitleChange,
  onDescriptionChange,
  onNotifyNetworkChange
}: EventFormFieldsProps) => {
  return (
    <>
      {/* Title */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={generateDefaultTitle(eventType)}
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
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
          onCheckedChange={onNotifyNetworkChange}
        />
      </div>
    </>
  );
};

export default EventFormFields;
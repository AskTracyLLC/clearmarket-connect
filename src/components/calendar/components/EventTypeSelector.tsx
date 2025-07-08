import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getEventTypeOptions } from "../utils/eventTypeUtils";

interface EventTypeSelectorProps {
  userRole: "field_rep" | "vendor";
  value: string;
  onChange: (value: string) => void;
}

const EventTypeSelector = ({ userRole, value, onChange }: EventTypeSelectorProps) => {
  const eventTypeOptions = getEventTypeOptions(userRole);

  if (eventTypeOptions.length <= 1) {
    return null;
  }

  return (
    <div>
      <Label className="text-base font-medium">Event Type</Label>
      <RadioGroup value={value} onValueChange={onChange} className="mt-2">
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
  );
};

export default EventTypeSelector;
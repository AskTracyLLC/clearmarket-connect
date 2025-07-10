import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export const AdvancedFilters = ({ onFiltersChange }: AdvancedFiltersProps) => {
  const [trustScoreRange, setTrustScoreRange] = useState([60, 100]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("any");

  const services = [
    "BPO Exterior", "BPO Interior", "REO Exterior", "REO Interior",
    "Occupancy Check", "Property Preservation", "Lockouts",
    "Utility Transfers", "Debris Removal", "Lawn Care"
  ];

  const handleServiceToggle = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(updated);
    onFiltersChange({
      trustScoreRange,
      services: updated,
      availability: availabilityFilter
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trust Score Filter */}
        <div className="space-y-3">
          <Label>Minimum Trust Score: {trustScoreRange[0]}</Label>
          <Slider
            value={trustScoreRange}
            onValueChange={(value) => {
              setTrustScoreRange(value);
              onFiltersChange({
                trustScoreRange: value,
                services: selectedServices,
                availability: availabilityFilter
              });
            }}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Services Filter */}
        <div className="space-y-3">
          <Label>Services Offered</Label>
          <div className="grid grid-cols-2 gap-2">
            {services.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={selectedServices.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <Label htmlFor={service} className="text-sm">
                  {service}
                </Label>
              </div>
            ))}
          </div>
          {selectedServices.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedServices.map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleServiceToggle(service)}
                >
                  {service} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="space-y-3">
          <Label>Availability</Label>
          <div className="space-y-2">
            {["any", "immediately", "within_week", "within_month"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={availabilityFilter === option}
                  onCheckedChange={() => {
                    setAvailabilityFilter(option);
                    onFiltersChange({
                      trustScoreRange,
                      services: selectedServices,
                      availability: option
                    });
                  }}
                />
                <Label htmlFor={option} className="text-sm capitalize">
                  {option.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
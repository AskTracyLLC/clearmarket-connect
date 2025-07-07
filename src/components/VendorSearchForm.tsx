import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface SearchFilters {
  zipCode: string;
  platforms: string[];
  inspectionTypes: string[];
  abcRequired: boolean | null;
  hudKeyRequired: boolean | null;
  hudKeyCode: string;
}

interface VendorSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const VendorSearchForm = ({ onSearch }: VendorSearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedInspectionTypes, setSelectedInspectionTypes] = useState<string[]>([]);
  const [abcRequired, setAbcRequired] = useState<boolean | null>(null);
  const [hudKeyRequired, setHudKeyRequired] = useState<boolean | null>(null);
  const [hudKeyCode, setHudKeyCode] = useState("");

  const platforms = ["EZinspections", "InspectorADE", "SafeView", "WorldAPP", "Other"];
  const inspectionTypes = [
    "Interior/Exterior Inspections",
    "Exterior Only Inspections", 
    "Drive-by Inspections",
    "Occupancy Verification",
    "REO Services",
    "Property Preservation",
    "Damage Assessment",
    "High Quality Marketing Photos",
    "Appt-Based Inspections"
  ];

  const handleSearch = () => {
    if (zipCode.trim()) {
      onSearch({
        zipCode,
        platforms: selectedPlatforms,
        inspectionTypes: selectedInspectionTypes,
        abcRequired,
        hudKeyRequired,
        hudKeyCode
      });
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleInspectionType = (type: string) => {
    setSelectedInspectionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Find Field Reps in Your Area
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="zipCode">Search by Zip Code</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code (e.g., 90210)"
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSearch} variant="hero" className="px-8">
            Search
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 mb-4"
          >
            Advanced Filters
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showAdvanced && (
            <div className="space-y-6">
              {/* Inspection Platforms */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Inspection Platform(s)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={selectedPlatforms.includes(platform)}
                        onCheckedChange={() => togglePlatform(platform)}
                      />
                      <Label htmlFor={platform} className="text-sm font-normal cursor-pointer">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ABC# Required */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">ABC# Required?</Label>
                  <p className="text-sm text-muted-foreground">Filter by ABC certification requirement</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={abcRequired === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAbcRequired(abcRequired === true ? null : true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={abcRequired === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAbcRequired(abcRequired === false ? null : false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* HUD Key Required */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">HUD Key Required?</Label>
                    <p className="text-sm text-muted-foreground">Filter by HUD key requirement</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={hudKeyRequired === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHudKeyRequired(hudKeyRequired === true ? null : true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={hudKeyRequired === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHudKeyRequired(hudKeyRequired === false ? null : false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
                
                {hudKeyRequired === true && (
                  <div className="space-y-2">
                    <Label htmlFor="hudKeyCode">HUD Key Code</Label>
                    <Input
                      id="hudKeyCode"
                      value={hudKeyCode}
                      onChange={(e) => setHudKeyCode(e.target.value)}
                      placeholder="Enter HUD key code..."
                    />
                  </div>
                )}
              </div>

              {/* Inspection Types */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Inspection Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inspectionTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedInspectionTypes.includes(type)}
                        onCheckedChange={() => toggleInspectionType(type)}
                      />
                      <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSearchForm;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { SearchFilters } from "./search/SearchFilters";
import AdvancedFilters from "./search/AdvancedFilters";

interface VendorSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const VendorSearchForm = ({ onSearch }: VendorSearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedInspectionTypes, setSelectedInspectionTypes] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [abcRequired, setAbcRequired] = useState<boolean | null>(null);
  const [hudKeyRequired, setHudKeyRequired] = useState<boolean | null>(null);
  const [hudKeyCode, setHudKeyCode] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [onlyActiveUsers, setOnlyActiveUsers] = useState(false);
  const [sortBy, setSortBy] = useState("");

  const handleSearch = () => {
    if (zipCode.trim()) {
      onSearch({
        zipCode,
        platforms: selectedPlatforms,
        inspectionTypes: selectedInspectionTypes,
        abcRequired,
        hudKeyRequired,
        hudKeyCode,
        yearsExperience,
        availabilityStatus,
        certifications: selectedCertifications,
        onlyActiveUsers,
        sortBy
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

  const toggleCertification = (cert: string) => {
    setSelectedCertifications(prev => 
      prev.includes(cert) 
        ? prev.filter(c => c !== cert)
        : [...prev, cert]
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

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="activeOnly"
              checked={onlyActiveUsers}
              onCheckedChange={setOnlyActiveUsers}
            />
            <Label htmlFor="activeOnly" className="text-sm">Show only active users</Label>
          </div>
          {sortBy && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
              Sorted by: {sortBy}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => setSortBy("")}
              >
                ×
              </Button>
            </div>
          )}
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
            <AdvancedFilters
              selectedPlatforms={selectedPlatforms}
              selectedInspectionTypes={selectedInspectionTypes}
              selectedCertifications={selectedCertifications}
              abcRequired={abcRequired}
              hudKeyRequired={hudKeyRequired}
              hudKeyCode={hudKeyCode}
              yearsExperience={yearsExperience}
              availabilityStatus={availabilityStatus}
              sortBy={sortBy}
              onPlatformToggle={togglePlatform}
              onInspectionTypeToggle={toggleInspectionType}
              onCertificationToggle={toggleCertification}
              onAbcRequiredChange={setAbcRequired}
              onHudKeyRequiredChange={setHudKeyRequired}
              onHudKeyCodeChange={setHudKeyCode}
              onYearsExperienceChange={setYearsExperience}
              onAvailabilityStatusChange={setAvailabilityStatus}
              onSortByChange={setSortBy}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSearchForm;
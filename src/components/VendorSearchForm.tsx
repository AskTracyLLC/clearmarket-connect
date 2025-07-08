import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { SearchFilters } from "./search/SearchFilters";
import AdvancedFilters from "./search/AdvancedFilters";
import QuickFilters from "./search/QuickFilters";
import { useSearchFilters } from "@/hooks/useSearchFilters";

interface VendorSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const VendorSearchForm = ({ onSearch }: VendorSearchFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const {
    zipCode,
    setZipCode,
    selectedPlatforms,
    selectedInspectionTypes,
    selectedCertifications,
    abcRequired,
    hudKeyRequired,
    hudKeyCode,
    yearsExperience,
    availabilityStatus,
    onlyActiveUsers,
    sortBy,
    setAbcRequired,
    setHudKeyRequired,
    setHudKeyCode,
    setYearsExperience,
    setAvailabilityStatus,
    setOnlyActiveUsers,
    setSortBy,
    togglePlatform,
    toggleInspectionType,
    toggleCertification,
    getFilters
  } = useSearchFilters();

  const handleSearch = () => {
    if (zipCode.trim()) {
      onSearch(getFilters());
    }
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

        <QuickFilters
          onlyActiveUsers={onlyActiveUsers}
          onOnlyActiveUsersChange={setOnlyActiveUsers}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

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
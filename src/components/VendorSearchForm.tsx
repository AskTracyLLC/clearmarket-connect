import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { SearchFilters } from "./search/SearchFilters";
import AdvancedFilters from "./search/AdvancedFilters";
import QuickFilters from "./search/QuickFilters";
import CreditFilterWarning from "./search/CreditFilterWarning";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useSearchCredits } from "@/hooks/useSearchCredits";

interface VendorSearchFormProps {
  onSearch: (filters: SearchFilters, paidFilters?: {
    platforms: boolean;
    abcRequired: boolean;
    hudKeyRequired: boolean;
    inspectionTypes: boolean;
  }) => void;
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
    onlyOutOfNetwork,
    sortBy,
    setAbcRequired,
    setHudKeyRequired,
    setHudKeyCode,
    setYearsExperience,
    setAvailabilityStatus,
    setOnlyActiveUsers,
    setOnlyOutOfNetwork,
    setSortBy,
    togglePlatform,
    toggleInspectionType,
    toggleCertification,
    getFilters
  } = useSearchFilters();

  const {
    paidFilters,
    isSpendingCredits,
    calculateCreditCost,
    spendCreditsForSearch,
    resetPaidFilters,
  } = useSearchCredits();

  const creditCost = calculateCreditCost(
    selectedPlatforms,
    abcRequired,
    hudKeyRequired,
    selectedInspectionTypes
  );

  const handleSearch = async () => {
    if (!zipCode.trim()) return;

    if (creditCost > 0) {
      const success = await spendCreditsForSearch(
        selectedPlatforms,
        abcRequired,
        hudKeyRequired,
        selectedInspectionTypes
      );
      if (!success) return;
    }

    onSearch(getFilters(), paidFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Find Field Reps in Your Area
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="zipCode">Search by Zip Code</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code (e.g., 90210)"
                className="pl-10 min-h-[44px]"
              />
            </div>
          </div>
          <Button 
            onClick={handleSearch} 
            variant="hero" 
            className="px-6 sm:px-8 min-h-[44px] w-full sm:w-auto"
            disabled={isSpendingCredits}
          >
            {isSpendingCredits ? "Processing..." : "Search"}
          </Button>
        </div>

        <QuickFilters
          onlyActiveUsers={onlyActiveUsers}
          onOnlyActiveUsersChange={setOnlyActiveUsers}
          onlyOutOfNetwork={onlyOutOfNetwork}
          onOnlyOutOfNetworkChange={setOnlyOutOfNetwork}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        <CreditFilterWarning 
          creditCost={creditCost} 
          isVisible={showAdvanced && creditCost > 0} 
        />

        <div className="border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 mb-4 min-h-[44px]"
          >
            <span className="text-sm sm:text-base">Advanced Filters</span>
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
              paidFilters={paidFilters}
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
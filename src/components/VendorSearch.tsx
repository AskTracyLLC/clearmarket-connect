import { useState } from "react";
import VendorSearchForm from "./VendorSearchForm";
import VendorSearchResults from "./VendorSearchResults";
import { useSearchCredits } from "@/hooks/useSearchCredits";

interface SearchFilters {
  zipCode: string;
  platforms: string[];
  inspectionTypes: string[];
  abcRequired: boolean | null;
  hudKeyRequired: boolean | null;
  hudKeyCode: string;
  yearsExperience: string;
  availabilityStatus: string;
  certifications: string[];
  onlyActiveUsers: boolean;
  onlyOutOfNetwork: boolean;
  sortBy: string;
}

interface PaidFilters {
  platforms: boolean;
  abcRequired: boolean;
  hudKeyRequired: boolean;
  inspectionTypes: boolean;
}

const VendorSearch = () => {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [paidFilters, setPaidFilters] = useState<PaidFilters | null>(null);
  const { refundCredits } = useSearchCredits();

  const handleSearch = (filters: SearchFilters, paid?: PaidFilters) => {
    setSearchFilters(filters);
    setPaidFilters(paid || null);
    setSearchPerformed(true);
  };

  const handleRefundNeeded = () => {
    if (searchFilters) {
      refundCredits(
        searchFilters.platforms,
        searchFilters.abcRequired,
        searchFilters.hudKeyRequired,
        searchFilters.inspectionTypes
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <VendorSearchForm onSearch={handleSearch} />
      
      {searchPerformed && searchFilters && (
        <VendorSearchResults 
          filters={searchFilters} 
          paidFilters={paidFilters} 
          onRefundNeeded={handleRefundNeeded}
        />
      )}
    </div>
  );
};

export default VendorSearch;
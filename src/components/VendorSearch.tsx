import { useState } from "react";
import VendorSearchForm from "./VendorSearchForm";
import VendorSearchResults from "./VendorSearchResults";

interface SearchFilters {
  zipCode: string;
  platforms: string[];
  inspectionTypes: string[];
  abcRequired: boolean | null;
  hudKeyRequired: boolean | null;
  hudKeyCode: string;
}

const VendorSearch = () => {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSearchPerformed(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <VendorSearchForm onSearch={handleSearch} />
      
      {searchPerformed && searchFilters && (
        <VendorSearchResults filters={searchFilters} />
      )}
    </div>
  );
};

export default VendorSearch;
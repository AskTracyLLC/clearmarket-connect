import { useState } from "react";
import FieldRepSearchForm from "./FieldRepSearchForm";
import FieldRepSearchResults from "./FieldRepSearchResults";

interface SearchFilters {
  zipCode: string;
  coverageAreas: string[];
  workTypes: string[];
  platforms: string[];
  minimumPayment: string;
  monthlyVolume: string;
  sortBy: string;
}

const FieldRepSearch = () => {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSearchPerformed(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Find Work Opportunities</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search for vendors in your area who are looking for field representatives. 
          Connect with out-of-network vendors to expand your opportunities.
        </p>
      </div>
      
      <FieldRepSearchForm onSearch={handleSearch} />
      
      {searchPerformed && searchFilters && (
        <FieldRepSearchResults filters={searchFilters} />
      )}
    </div>
  );
};

export default FieldRepSearch;
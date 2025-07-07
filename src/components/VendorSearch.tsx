import { useState } from "react";
import VendorSearchForm from "./VendorSearchForm";
import VendorSearchResults from "./VendorSearchResults";

const VendorSearch = () => {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchedZipCode, setSearchedZipCode] = useState("");

  const handleSearch = (zipCode: string) => {
    setSearchedZipCode(zipCode);
    setSearchPerformed(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <VendorSearchForm onSearch={handleSearch} />
      
      {searchPerformed && (
        <VendorSearchResults zipCode={searchedZipCode} />
      )}
    </div>
  );
};

export default VendorSearch;
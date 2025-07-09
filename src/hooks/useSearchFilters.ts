import { useState } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";

export const useSearchFilters = () => {
  const [zipCode, setZipCode] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedInspectionTypes, setSelectedInspectionTypes] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [abcRequired, setAbcRequired] = useState<boolean | null>(null);
  const [hudKeyRequired, setHudKeyRequired] = useState<boolean | null>(null);
  const [hudKeyCode, setHudKeyCode] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [onlyActiveUsers, setOnlyActiveUsers] = useState(false);
  const [onlyOutOfNetwork, setOnlyOutOfNetwork] = useState(false);
  const [sortBy, setSortBy] = useState("");

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

  const getFilters = (): SearchFilters => ({
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
    onlyOutOfNetwork,
    sortBy
  });

  return {
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
  };
};
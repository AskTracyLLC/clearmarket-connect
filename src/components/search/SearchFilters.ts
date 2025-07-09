export interface SearchFilters {
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

export const platforms = ["EZinspections", "InspectorADE", "SafeView", "WorldAPP", "Other"];

export const inspectionTypes = [
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

export const experienceOptions = [
  "Less than 1 year",
  "1-2 years", 
  "3-5 years",
  "5+ years"
];

export const availabilityOptions = [
  "Available",
  "Busy", 
  "Not Taking Work"
];

export const certificationOptions = [
  "HUD Key Access",
  "ABC Certification",
  "Insurance License",
  "Real Estate License",
  "Drone Pilot License"
];

export const sortOptions = [
  "Distance",
  "Trust Score",
  "Community Score", 
  "Last Active",
  "Years Experience"
];
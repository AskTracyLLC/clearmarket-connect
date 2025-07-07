export const formatPhoneNumber = (value: string) => {
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const workTypes = [
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

export const platforms = [
  "EZinspections",
  "InspectorADE", 
  "SafeView",
  "WorldAPP",
  "Other"
];
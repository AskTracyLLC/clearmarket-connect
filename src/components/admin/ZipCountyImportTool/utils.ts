import { ZipCountyClassification, ParsedData } from "./types";

export const downloadTemplate = () => {
  const templateData = [
    "Zip_Code,State,County_Name,Rural_Urban_Designation",
    "60616,IL,Cook County,Urban",
    "79329,TX,Lynn County,Rural"
  ].join("\n");

  const blob = new Blob([templateData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "zip_county_template.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

export const parseCSV = (csvText: string): ParsedData => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  
  const requiredHeaders = ["Zip_Code", "State", "County_Name", "Rural_Urban_Designation"];
  const headerMap = requiredHeaders.reduce((map, header) => {
    const index = headers.findIndex(h => h.toLowerCase() === header.toLowerCase());
    map[header] = index;
    return map;
  }, {} as Record<string, number>);

  const valid: ZipCountyClassification[] = [];
  const errors: { row: number; errors: string[] }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    const rowErrors: string[] = [];

    // Check if all required columns exist
    if (Object.values(headerMap).some(index => index === -1)) {
      rowErrors.push("Missing required columns");
      continue;
    }

    const zipCode = values[headerMap["Zip_Code"]];
    const state = values[headerMap["State"]];
    const countyName = values[headerMap["County_Name"]];
    const ruralUrban = values[headerMap["Rural_Urban_Designation"]];

    // Validate and normalize zip code
    let normalizedZipCode = zipCode;
    if (!zipCode) {
      rowErrors.push("ZIP code is required");
    } else {
      // Remove any non-digit characters and leading zeros, then pad to 5 digits
      const cleanZip = zipCode.replace(/\D/g, '');
      if (cleanZip.length === 0) {
        rowErrors.push("Invalid ZIP code format");
      } else if (cleanZip.length > 5) {
        // Take first 5 digits if longer (handles ZIP+4 format)
        normalizedZipCode = cleanZip.substring(0, 5);
      } else {
        // Pad with leading zeros if shorter
        normalizedZipCode = cleanZip.padStart(5, '0');
      }
    }

    // Validate state (2 letters)
    if (!state || !/^[A-Z]{2}$/i.test(state)) {
      rowErrors.push("Invalid state (must be 2 letters)");
    }

    // Validate county name
    if (!countyName) {
      rowErrors.push("County name is required");
    }

    // FIXED: Complete the rural/urban validation
    if (!ruralUrban || !["Rural", "Urban"].includes(ruralUrban)) {
      rowErrors.push("Rural/Urban designation must be either 'Rural' or 'Urban'");
    }

    if (rowErrors.length > 0) {
      errors.push({ row: i + 1, errors: rowErrors });
    } else {
      valid.push({
        zip_code: normalizedZipCode,
        state: state.toUpperCase(),
        county_name: countyName,
        rural_urban_designation: ruralUrban as "Rural" | "Urban"
      });
    }
  }

  return { valid, errors };
};

export const filterData = (
  data: ZipCountyClassification[],
  searchZip: string,
  searchCounty: string,
  filterState: string,
  filterRuralUrban: string
): ZipCountyClassification[] => {
  return data.filter(item => {
    const matchesZip = !searchZip || item.zip_code.includes(searchZip);
    const matchesCounty = !searchCounty || item.county_name.toLowerCase().includes(searchCounty.toLowerCase());
    const matchesState = !filterState || item.state === filterState;
    const matchesRuralUrban = !filterRuralUrban || item.rural_urban_designation === filterRuralUrban;
    
    return matchesZip && matchesCounty && matchesState && matchesRuralUrban;
  });
};
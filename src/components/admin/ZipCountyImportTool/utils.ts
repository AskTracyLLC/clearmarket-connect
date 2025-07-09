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

    // Validate zip code (5 digits)
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      rowErrors.push("Invalid ZIP code (must be 5 digits)");
    }

    // Validate state (2 letters)
    if (!state || !/^[A-Z]{2}$/i.test(state)) {
      rowErrors.push("Invalid state (must be 2 letters)");
    }

    // Validate county name
    if (!countyName) {
      rowErrors.push("County name is required");
    }

    // Validate rural/urban designation
    if (!ruralUrban || !["Rural", "Urban"].includes(ruralUrban)) {
      rowErrors.push("Rural/Urban designation must be 'Rural' or 'Urban'");
    }

    if (rowErrors.length > 0) {
      errors.push({ row: i + 1, errors: rowErrors });
    } else {
      valid.push({
        zip_code: zipCode,
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
  let filtered = [...data];

  if (searchZip) {
    filtered = filtered.filter(item => 
      item.zip_code.includes(searchZip)
    );
  }

  if (searchCounty) {
    filtered = filtered.filter(item => 
      item.county_name.toLowerCase().includes(searchCounty.toLowerCase())
    );
  }

  if (filterState && filterState !== "all") {
    filtered = filtered.filter(item => item.state === filterState);
  }

  if (filterRuralUrban && filterRuralUrban !== "all") {
    filtered = filtered.filter(item => item.rural_urban_designation === filterRuralUrban);
  }

  return filtered;
};
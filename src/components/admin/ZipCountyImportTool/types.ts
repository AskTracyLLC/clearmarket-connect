export interface ZipCountyClassification {
  id?: string;
  zip_code: string;
  state: string;
  county_name: string;
  rural_urban_designation: "Rural" | "Urban";
}

export interface ParsedData {
  valid: ZipCountyClassification[];
  errors: { row: number; errors: string[] }[];
}

export interface FilterState {
  searchZip: string;
  searchCounty: string;
  filterState: string;
  filterRuralUrban: string;
}
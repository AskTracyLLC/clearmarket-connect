import { useEffect } from "react";
import { SearchFilters } from "./SearchFilters";
import { DataTable } from "./DataTable";
import { ZipCountyClassification, FilterState } from "./types";

interface ManageTabProps {
  existingData: ZipCountyClassification[];
  filteredData: ZipCountyClassification[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onUpdateRecord: (id: string, designation: "Rural" | "Urban") => Promise<void>;
  onFetchData: () => Promise<void>;
}

export const ManageTab = ({
  existingData,
  filteredData,
  filters,
  onFiltersChange,
  onApplyFilters,
  onUpdateRecord,
  onFetchData
}: ManageTabProps) => {
  useEffect(() => {
    onFetchData();
  }, [onFetchData]);

  const uniqueStates = [...new Set(existingData.map(item => item.state))].sort();

  return (
    <div className="space-y-4">
      <SearchFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        uniqueStates={uniqueStates}
        onApplyFilters={onApplyFilters}
      />

      <DataTable
        data={filteredData}
        onUpdateRecord={onUpdateRecord}
      />

      {filteredData.length === 0 && existingData.length > 0 && (
        <p className="text-center text-muted-foreground py-4">
          No records match your search criteria
        </p>
      )}

      {existingData.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No data imported yet. Use the Import tab to upload data.
        </p>
      )}
    </div>
  );
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { FilterState } from "./types";

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  uniqueStates: string[];
  onApplyFilters: () => void;
}

export const SearchFilters = ({
  filters,
  onFiltersChange,
  uniqueStates,
  onApplyFilters
}: SearchFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Search by ZIP</Label>
          <Input
            placeholder="Enter ZIP code"
            value={filters.searchZip}
            onChange={(e) => updateFilter("searchZip", e.target.value)}
          />
        </div>
        <div>
          <Label>Search by County</Label>
          <Input
            placeholder="Enter county name"
            value={filters.searchCounty}
            onChange={(e) => updateFilter("searchCounty", e.target.value)}
          />
        </div>
        <div>
          <Label>Filter by State</Label>
          <Select value={filters.filterState} onValueChange={(value) => updateFilter("filterState", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {uniqueStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Filter by Classification</Label>
          <Select value={filters.filterRuralUrban} onValueChange={(value) => updateFilter("filterRuralUrban", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Rural">Rural</SelectItem>
              <SelectItem value="Urban">Urban</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={onApplyFilters} className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  );
};
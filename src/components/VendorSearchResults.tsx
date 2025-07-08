import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { mockResults } from "@/data/mockData";
import VendorResultCard from "./VendorResultCard";
import { VendorResultSkeleton } from "@/components/ui/skeleton-loader";
import { SearchEmptyState } from "@/components/ui/empty-states";

interface SearchFilters {
  zipCode: string;
  platforms: string[];
  inspectionTypes: string[];
  abcRequired: boolean | null;
  hudKeyRequired: boolean | null;
  hudKeyCode: string;
}

interface VendorSearchResultsProps {
  filters: SearchFilters;
  isLoading?: boolean;
}

const VendorSearchResults = ({ filters, isLoading = false }: VendorSearchResultsProps) => {
  // Filter results based on search criteria
  const filteredResults = mockResults.filter(rep => {
    // Platform filter
    if (filters.platforms.length > 0) {
      const hasMatchingPlatform = filters.platforms.some(platform => 
        rep.platforms.includes(platform)
      );
      if (!hasMatchingPlatform) return false;
    }

    // Inspection type filter
    if (filters.inspectionTypes.length > 0) {
      const hasMatchingType = filters.inspectionTypes.some(type => 
        rep.inspectionTypes.includes(type)
      );
      if (!hasMatchingType) return false;
    }

    // ABC# filter
    if (filters.abcRequired !== null) {
      if (rep.abcRequired !== filters.abcRequired) return false;
    }

    // HUD Key filter
    if (filters.hudKeyRequired !== null) {
      if (rep.hudKeyRequired !== filters.hudKeyRequired) return false;
    }

    // HUD Key code filter (if specific code is required)
    if (filters.hudKeyRequired === true && filters.hudKeyCode.trim()) {
      if (!rep.hudKeyCode || !rep.hudKeyCode.toLowerCase().includes(filters.hudKeyCode.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Searching {filters.zipCode}...
          </h2>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <VendorResultSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Search Results for {filters.zipCode}
        </h2>
        <span className="text-sm text-muted-foreground">
          {filteredResults.length} rep{filteredResults.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="space-y-4">
        {filteredResults.map((rep) => (
          <VendorResultCard key={rep.id} rep={rep} />
        ))}
      </div>

      {filteredResults.length === 0 && (
        <SearchEmptyState zipCode={filters.zipCode} />
      )}
    </div>
  );
};

export default VendorSearchResults;
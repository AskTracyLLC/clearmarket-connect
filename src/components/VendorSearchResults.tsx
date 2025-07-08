import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { mockResults } from "@/data/mockData";
import VendorResultCard from "./VendorResultCard";
import { VendorResultSkeleton } from "@/components/ui/skeleton-loader";
import { SearchEmptyState } from "@/components/ui/empty-states";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface SearchFilters {
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
  sortBy: string;
}

interface VendorSearchResultsProps {
  filters: SearchFilters;
  isLoading?: boolean;
}

const VendorSearchResults = ({ filters, isLoading = false }: VendorSearchResultsProps) => {
  const { user } = useAuth();
  
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

  // Show limited info for non-authenticated users (skip in development)
  if (!user && !import.meta.env.DEV) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Search Results for {filters.zipCode}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredResults.length} rep{filteredResults.length !== 1 ? 's' : ''} found
          </span>
        </div>
        
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">
                There are {filteredResults.length} Field Rep{filteredResults.length !== 1 ? 's' : ''} in this area
              </h3>
              <p className="text-muted-foreground">
                To view full profiles and unlock contact details, please create a Vendor profile or log in.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="hero">
                <Link to="/auth">Log In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/vendor/profile">Create Vendor Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredResults.length === 0 && (
          <SearchEmptyState zipCode={filters.zipCode} />
        )}
      </div>
    );
  }

  // Full experience for authenticated users
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
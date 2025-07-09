import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { mockResults } from "@/data/mockData";
import VendorResultCard from "./VendorResultCard";
import { VendorResultSkeleton } from "@/components/ui/skeleton-loader";
import { SearchEmptyState } from "@/components/ui/empty-states";
import { useAuth } from "@/contexts/AuthContext";
import { useNetworkConnections } from "@/hooks/useNetworkConnections";
import { useSearchCredits } from "@/hooks/useSearchCredits";
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
  onlyOutOfNetwork: boolean;
  sortBy: string;
}

interface VendorSearchResultsProps {
  filters: SearchFilters;
  paidFilters?: {
    platforms: boolean;
    abcRequired: boolean;
    hudKeyRequired: boolean;
    inspectionTypes: boolean;
  } | null;
  isLoading?: boolean;
  onRefundNeeded?: () => void;
}

const VendorSearchResults = ({ filters, paidFilters, isLoading = false, onRefundNeeded }: VendorSearchResultsProps) => {
  const { user } = useAuth();
  const { isInNetwork } = useNetworkConnections();
  
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

    // Out-of-network filter
    if (filters.onlyOutOfNetwork && user) {
      if (isInNetwork(rep.id.toString())) {
        return false;
      }
    }

    return true;
  });

  // Separate results into in-network and out-of-network
  const inNetworkResults = user ? filteredResults.filter(rep => isInNetwork(rep.id.toString())) : [];
  const outOfNetworkResults = user ? filteredResults.filter(rep => !isInNetwork(rep.id.toString())) : filteredResults;
  
  // Check if refund is needed (no out-of-network results or only in-network results)
  const shouldRefund = user && (outOfNetworkResults.length === 0 || (filteredResults.length > 0 && outOfNetworkResults.length === 0));
  
  // Trigger refund if needed
  useEffect(() => {
    if (shouldRefund && onRefundNeeded && paidFilters) {
      const hasUsedPaidFilters = Object.values(paidFilters).some(Boolean);
      if (hasUsedPaidFilters) {
        onRefundNeeded();
      }
    }
  }, [shouldRefund, onRefundNeeded, paidFilters]);

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
          <VendorResultCard key={rep.id} rep={rep} paidFilters={paidFilters} />
        ))}
      </div>

      {filteredResults.length === 0 && (
        <SearchEmptyState zipCode={filters.zipCode} />
      )}
      
      {shouldRefund && filteredResults.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardContent className="text-center space-y-2">
            <p className="text-green-800 dark:text-green-200 font-medium">
              No Search Results = No Charge
            </p>
            <p className="text-green-600 dark:text-green-400 text-sm">
              {outOfNetworkResults.length === 0 
                ? "No out-of-network field reps found. Credits have been refunded." 
                : "Only in-network field reps found. Credits have been refunded."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorSearchResults;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CommunityFiltersProps {
  selectedCategories: string[];
  selectedSystems: string[];
  onCategoryChange: (categories: string[]) => void;
  onSystemChange: (systems: string[]) => void;
  onClearFilters: () => void;
}

const categories = [
  "Coverage Needed",
  "Platform Help", 
  "Warnings",
  "Tips",
  "Industry News"
];

const systems = [
  "EZinspections",
  "InspectorADE", 
  "SafeView",
  "Clear Capital",
  "ServiceLink",
  "WorldAPP"
];

const CommunityFilters = ({ 
  selectedCategories, 
  selectedSystems, 
  onCategoryChange, 
  onSystemChange,
  onClearFilters 
}: CommunityFiltersProps) => {
  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(updated);
  };

  const handleSystemToggle = (system: string) => {
    const updated = selectedSystems.includes(system)
      ? selectedSystems.filter(s => s !== system)
      : [...selectedSystems, system];
    onSystemChange(updated);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedSystems.length > 0;

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* System Familiarity */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">System Familiarity</h4>
          <div className="space-y-2">
            {systems.map((system) => (
              <div key={system} className="flex items-center space-x-2">
                <Checkbox
                  id={`system-${system}`}
                  checked={selectedSystems.includes(system)}
                  onCheckedChange={() => handleSystemToggle(system)}
                />
                <label
                  htmlFor={`system-${system}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {system}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Filters</h4>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {selectedSystems.map((system) => (
                <Badge
                  key={system}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleSystemToggle(system)}
                >
                  {system}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityFilters;
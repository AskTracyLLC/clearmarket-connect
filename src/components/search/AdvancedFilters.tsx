import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  platforms, 
  inspectionTypes, 
  experienceOptions, 
  availabilityOptions, 
  certificationOptions, 
  sortOptions 
} from "./SearchFilters";

interface AdvancedFiltersProps {
  selectedPlatforms: string[];
  selectedInspectionTypes: string[];
  selectedCertifications: string[];
  abcRequired: boolean | null;
  hudKeyRequired: boolean | null;
  hudKeyCode: string;
  yearsExperience: string;
  availabilityStatus: string;
  sortBy: string;
  onPlatformToggle: (platform: string) => void;
  onInspectionTypeToggle: (type: string) => void;
  onCertificationToggle: (cert: string) => void;
  onAbcRequiredChange: (value: boolean | null) => void;
  onHudKeyRequiredChange: (value: boolean | null) => void;
  onHudKeyCodeChange: (value: string) => void;
  onYearsExperienceChange: (value: string) => void;
  onAvailabilityStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
}

const AdvancedFilters = ({
  selectedPlatforms,
  selectedInspectionTypes,
  selectedCertifications,
  abcRequired,
  hudKeyRequired,
  hudKeyCode,
  yearsExperience,
  availabilityStatus,
  sortBy,
  onPlatformToggle,
  onInspectionTypeToggle,
  onCertificationToggle,
  onAbcRequiredChange,
  onHudKeyRequiredChange,
  onHudKeyCodeChange,
  onYearsExperienceChange,
  onAvailabilityStatusChange,
  onSortByChange
}: AdvancedFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Sort By</Label>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose sort order..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Years of Experience */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Years of Experience</Label>
        <Select value={yearsExperience} onValueChange={onYearsExperienceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Any experience level..." />
          </SelectTrigger>
          <SelectContent>
            {experienceOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability Status */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Availability Status</Label>
        <Select value={availabilityStatus} onValueChange={onAvailabilityStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Any availability..." />
          </SelectTrigger>
          <SelectContent>
            {availabilityOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Certifications & Special Access</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certificationOptions.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={cert}
                checked={selectedCertifications.includes(cert)}
                onCheckedChange={() => onCertificationToggle(cert)}
              />
              <Label htmlFor={cert} className="text-sm font-normal cursor-pointer">
                {cert}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Platforms */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Inspection Platform(s)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={platform}
                checked={selectedPlatforms.includes(platform)}
                onCheckedChange={() => onPlatformToggle(platform)}
              />
              <Label htmlFor={platform} className="text-sm font-normal cursor-pointer">
                {platform}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* ABC# Required */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div className="space-y-1">
          <Label className="text-base font-medium">ABC# Required?</Label>
          <p className="text-sm text-muted-foreground">Filter by ABC certification requirement</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={abcRequired === true ? "default" : "outline"}
            size="sm"
            onClick={() => onAbcRequiredChange(abcRequired === true ? null : true)}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={abcRequired === false ? "default" : "outline"}
            size="sm"
            onClick={() => onAbcRequiredChange(abcRequired === false ? null : false)}
          >
            No
          </Button>
        </div>
      </div>

      {/* HUD Key Required */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="space-y-1">
            <Label className="text-base font-medium">HUD Key Required?</Label>
            <p className="text-sm text-muted-foreground">Filter by HUD key requirement</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={hudKeyRequired === true ? "default" : "outline"}
              size="sm"
              onClick={() => onHudKeyRequiredChange(hudKeyRequired === true ? null : true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={hudKeyRequired === false ? "default" : "outline"}
              size="sm"
              onClick={() => onHudKeyRequiredChange(hudKeyRequired === false ? null : false)}
            >
              No
            </Button>
          </div>
        </div>
        
        {hudKeyRequired === true && (
          <div className="space-y-2">
            <Label htmlFor="hudKeyCode">HUD Key Code</Label>
            <Input
              id="hudKeyCode"
              value={hudKeyCode}
              onChange={(e) => onHudKeyCodeChange(e.target.value)}
              placeholder="Enter HUD key code..."
            />
          </div>
        )}
      </div>

      {/* Inspection Types */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Inspection Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inspectionTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedInspectionTypes.includes(type)}
                onCheckedChange={() => onInspectionTypeToggle(type)}
              />
              <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
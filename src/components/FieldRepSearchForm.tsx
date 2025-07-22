import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin, Briefcase } from "lucide-react";
import { useWorkTypes } from "@/hooks/useWorkTypes";
import { usePlatforms } from "@/hooks/usePlatforms";

interface SearchFilters {
  zipCode: string;
  coverageAreas: string[];
  workTypes: string[];
  platforms: string[];
  minimumPayment: string;
  monthlyVolume: string;
  sortBy: string;
}

interface FieldRepSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const FieldRepSearchForm = ({ onSearch }: FieldRepSearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minimumPayment, setMinimumPayment] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [sortBy, setSortBy] = useState("");

  const { workTypes, loading: workTypesLoading } = useWorkTypes();
  const { platforms, loading: platformsLoading } = usePlatforms();

  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkTypes([...selectedWorkTypes, workType]);
    } else {
      setSelectedWorkTypes(selectedWorkTypes.filter(type => type !== workType));
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      zipCode,
      coverageAreas: [zipCode], // Simplified for now
      workTypes: selectedWorkTypes,
      platforms: selectedPlatforms,
      minimumPayment,
      monthlyVolume,
      sortBy
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search for Work Opportunities
        </CardTitle>
        <CardDescription>
          Find vendors who are actively seeking field representatives in your area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ZIP Code or Area
            </Label>
            <Input
              id="zipCode"
              placeholder="Enter ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>

          {/* Work Types */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Types
            </Label>
            {workTypesLoading ? (
              <div className="text-sm text-muted-foreground">Loading work types...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {workTypes.map((workType) => (
                  <div key={workType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={workType.id}
                      checked={selectedWorkTypes.includes(workType.name)}
                      onCheckedChange={(checked) => handleWorkTypeChange(workType.name, checked as boolean)}
                    />
                    <Label htmlFor={workType.id} className="text-sm">
                      {workType.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platforms */}
          <div className="space-y-3">
            <Label>Preferred Platforms</Label>
            {platformsLoading ? (
              <div className="text-sm text-muted-foreground">Loading platforms...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.name)}
                      onCheckedChange={(checked) => handlePlatformChange(platform.name, checked as boolean)}
                    />
                    <Label htmlFor={platform.id} className="text-sm">
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Minimum Payment per Order */}
          <div className="space-y-2">
            <Label htmlFor="minimumPayment">Minimum $ Amount per Order</Label>
            <Input
              id="minimumPayment"
              type="number"
              placeholder="Enter minimum payment amount"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Volume */}
          <div className="space-y-2">
            <Label htmlFor="monthlyVolume">Minimum Monthly Volume</Label>
            <Select value={monthlyVolume} onValueChange={setMonthlyVolume}>
              <SelectTrigger>
                <SelectValue placeholder="Select minimum volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 orders</SelectItem>
                <SelectItem value="11-25">11-25 orders</SelectItem>
                <SelectItem value="26-50">26-50 orders</SelectItem>
                <SelectItem value="51-100">51-100 orders</SelectItem>
                <SelectItem value="100+">100+ orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort Results By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Choose sorting option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="payment">Payment Rate</SelectItem>
                <SelectItem value="volume">Monthly Volume</SelectItem>
                <SelectItem value="recent">Recently Posted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Search for Work Opportunities
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FieldRepSearchForm;
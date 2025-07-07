import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface VendorSearchFormProps {
  onSearch: (zipCode: string) => void;
}

const VendorSearchForm = ({ onSearch }: VendorSearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [systemFilter, setSystemFilter] = useState(false);

  const handleSearch = () => {
    if (zipCode.trim()) {
      onSearch(zipCode);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Find Field Reps in Your Area
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="zipCode">Search by Zip Code</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code (e.g., 90210)"
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSearch} variant="hero" className="px-8">
            Search
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="system-filter" className="text-base font-medium">
              Filter by System Familiarity
            </Label>
            <p className="text-sm text-muted-foreground">
              Show only reps familiar with your preferred platforms
            </p>
          </div>
          <Switch 
            id="system-filter" 
            checked={systemFilter}
            onCheckedChange={setSystemFilter}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSearchForm;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Lock } from "lucide-react";

// Mock search results data
const mockResults = [
  {
    id: 1,
    initials: "T.M.",
    distance: "4.2 mi away",
    systems: ["EZ", "IA"],
    inspectionTypes: ["Interior/Exterior", "Drive-by"],
    pricing: "$25-35"
  },
  {
    id: 2,
    initials: "J.D.",
    distance: "7.8 mi away",
    systems: ["IA", "SG"],
    inspectionTypes: ["Exterior Only", "Occupancy Check"],
    pricing: "$30-40"
  },
  {
    id: 3,
    initials: "M.R.",
    distance: "12.1 mi away",
    systems: ["EZ", "IA", "SG"],
    inspectionTypes: ["Interior/Exterior", "REO Trash Out"],
    pricing: "$45-55"
  }
];

const VendorSearch = () => {
  const [zipCode, setZipCode] = useState("");
  const [systemFilter, setSystemFilter] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = () => {
    if (zipCode.trim()) {
      setSearchPerformed(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Section */}
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

      {/* Search Results */}
      {searchPerformed && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Search Results for {zipCode}
          </h2>
          
          <div className="space-y-4">
            {mockResults.map((rep) => (
              <Card key={rep.id} className="hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      {/* Rep Info Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{rep.initials}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{rep.initials}</h3>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <MapPin className="h-3 w-3" />
                              <span>{rep.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Systems */}
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Systems:</Label>
                        <div className="flex gap-2">
                          {rep.systems.map((system) => (
                            <Badge key={system} variant="secondary">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Inspection Types */}
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Inspection Types:</Label>
                        <div className="flex flex-wrap gap-2">
                          {rep.inspectionTypes.map((type) => (
                            <Badge key={type} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Pricing:</Label>
                        <span className="text-sm font-medium text-foreground">{rep.pricing}</span>
                      </div>
                    </div>

                    {/* Unlock Contact Button */}
                    <div className="flex flex-col items-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline-primary" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Unlock Contact
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Unlock Contact Information</DialogTitle>
                            <DialogDescription>
                              Get access to {rep.initials}'s contact details
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-center text-foreground">
                                <span className="font-semibold">Unlock contact for 3 credits</span>
                              </p>
                              <p className="text-center text-muted-foreground text-sm mt-1">
                                Not enough credits? Earn or buy more.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <Button variant="outline" className="w-full">
                                Earn by Reviews
                              </Button>
                              <Button variant="hero" className="w-full">
                                Purchase Credits
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <div className="text-xs text-muted-foreground text-center">
                        3 credits required
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchPerformed && mockResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No field reps found in this area.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try expanding your search radius or check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorSearch;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import { useStates, useCountiesByState, type State } from "@/hooks/useLocationData";
import { CoverageArea } from "./types";

interface VendorCoverageAreasProps {
  coverageAreas: CoverageArea[];
  setCoverageAreas: React.Dispatch<React.SetStateAction<CoverageArea[]>>;
}

export const VendorCoverageAreas = ({ coverageAreas, setCoverageAreas }: VendorCoverageAreasProps) => {
  const { toast } = useToast();
  const { states } = useStates();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const { counties } = useCountiesByState(selectedState?.code);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [isAllCounties, setIsAllCounties] = useState(true);

  const handleStateChange = (stateCode: string) => {
    const state = states.find(s => s.code === stateCode);
    setSelectedState(state || null);
    setSelectedCounties([]);
    setIsAllCounties(true);
  };

  const handleAllCountiesChange = (checked: boolean) => {
    setIsAllCounties(checked);
    if (checked && selectedState) {
      setSelectedCounties(counties.map(c => c.id));
    } else {
      setSelectedCounties([]);
    }
  };

  const handleCountyChange = (countyId: string, checked: boolean) => {
    if (checked) {
      const newSelectedCounties = [...selectedCounties, countyId];
      setSelectedCounties(newSelectedCounties);
      // Check if all counties are now selected
      if (selectedState && newSelectedCounties.length === counties.length) {
        setIsAllCounties(true);
      }
    } else {
      setSelectedCounties(prev => prev.filter(id => id !== countyId));
      setIsAllCounties(false);
    }
  };

  const addCoverageArea = () => {
    if (!selectedState || selectedCounties.length === 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select a state and at least one county.",
        variant: "destructive",
      });
      return;
    }

    const existingArea = coverageAreas.find(area => area.stateCode === selectedState.code);
    if (existingArea) {
      toast({
        title: "State Already Added",
        description: "This state is already in your coverage areas. Please delete it first to modify.",
        variant: "destructive",
      });
      return;
    }

    const newCoverageArea: CoverageArea = {
      id: `${selectedState.code}-${Date.now()}`,
      state: selectedState.name,
      stateCode: selectedState.code,
      counties: isAllCounties 
        ? counties.map(c => c.name)
        : selectedCounties.map(id => counties.find(c => c.id === id)?.name || ""),
      isAllCounties,
    };

    setCoverageAreas(prev => [...prev, newCoverageArea]);
    setSelectedState(null);
    setSelectedCounties([]);
    setIsAllCounties(true);

    toast({
      title: "Coverage Area Added",
      description: `${selectedState.name} coverage has been added successfully.`,
    });
  };

  const removeCoverageArea = (id: string) => {
    setCoverageAreas(prev => prev.filter(area => area.id !== id));
    toast({
      title: "Coverage Area Removed",
      description: "Coverage area has been removed successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Coverage Areas</h3>
      
      {/* State Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state-select">Select State</Label>
          <Select onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedState && (
          <div className="space-y-2">
            <Label>County Selection</Label>
            <div className="border border-border rounded-lg p-3 max-h-96 overflow-y-auto">
              {/* Select All Counties - Always First */}
              <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border">
                <Checkbox
                  id="all-counties"
                  checked={isAllCounties}
                  onCheckedChange={handleAllCountiesChange}
                />
                <Label htmlFor="all-counties" className="font-medium text-primary">
                  Select All Counties
                </Label>
              </div>
              
              {/* Individual Counties - Two Column Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {counties
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((county) => (
                    <div key={county.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={county.id}
                        checked={selectedCounties.includes(county.id)}
                        onCheckedChange={(checked) => handleCountyChange(county.id, checked as boolean)}
                      />
                      <Label htmlFor={county.id} className="text-sm">
                        {county.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedState && (
        <Button 
          type="button" 
          onClick={addCoverageArea}
          variant="outline"
          className="w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Save Coverage Area
        </Button>
      )}

      {/* Coverage Areas Table */}
      {coverageAreas.length > 0 && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">Current Coverage Areas</Label>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Counties</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverageAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>{area.state}</TableCell>
                    <TableCell>
                      {area.isAllCounties 
                        ? "All Counties" 
                        : area.counties.join(", ")
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCoverageArea(area.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
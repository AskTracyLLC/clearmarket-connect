import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Info, Edit2, Save, X, Download } from "lucide-react";
import { useStates, useCountiesByState, type State } from "@/hooks/useLocationData";
import { useToast } from "@/hooks/use-toast";
import { CoverageArea } from "./types";

interface CoverageAreasProps {
  coverageAreas: CoverageArea[];
  setCoverageAreas: React.Dispatch<React.SetStateAction<CoverageArea[]>>;
}

export const CoverageAreas = ({ coverageAreas, setCoverageAreas }: CoverageAreasProps) => {
  const { toast } = useToast();
  const { states } = useStates();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const { counties } = useCountiesByState(selectedState?.code);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectAllCounties, setSelectAllCounties] = useState(false);
  const [standardPrice, setStandardPrice] = useState("");
  const [rushPrice, setRushPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ standardPrice: string; rushPrice: string }>({ standardPrice: "", rushPrice: "" });

  const handleStateChange = (stateCode: string) => {
    const state = states.find(s => s.code === stateCode);
    setSelectedState(state || null);
    setSelectedCounties([]);
    setSelectAllCounties(false);
  };

  const handleSelectAllCounties = (checked: boolean) => {
    setSelectAllCounties(checked);
    if (checked && selectedState) {
      setSelectedCounties(counties.map(c => c.id));
    } else {
      setSelectedCounties([]);
    }
  };

  const handleCountyToggle = (countyId: string, checked: boolean) => {
    if (checked) {
      const newSelectedCounties = [...selectedCounties, countyId];
      setSelectedCounties(newSelectedCounties);
      // Check if all counties are now selected
      if (selectedState && newSelectedCounties.length === counties.length) {
        setSelectAllCounties(true);
      }
    } else {
      setSelectedCounties(prev => prev.filter(id => id !== countyId));
      setSelectAllCounties(false);
    }
  };

  const addCoverageArea = () => {
    if (!selectedState || selectedCounties.length === 0 || !standardPrice || !rushPrice) {
      toast({
        title: "Missing Information",
        description: "Please select a state, counties, and enter both pricing tiers.",
        variant: "destructive",
      });
      return;
    }

    const newCoverage: CoverageArea = {
      id: `${selectedState.code}-${Date.now()}`,
      state: selectedState.name,
      stateCode: selectedState.code,
      counties: selectAllCounties 
        ? ["All Counties"] 
        : selectedCounties.map(id => 
            counties.find(c => c.id === id)?.name || ""
          ).filter(Boolean),
      standardPrice,
      rushPrice,
    };

    setCoverageAreas(prev => [...prev, newCoverage]);
    setSelectedState(null);
    setSelectedCounties([]);
    setSelectAllCounties(false);
    setStandardPrice("");
    setRushPrice("");
    
    toast({
      title: "Coverage Added",
      description: "Coverage area and pricing have been saved.",
    });
  };

  const removeCoverageArea = (id: string) => {
    setCoverageAreas(prev => prev.filter(area => area.id !== id));
    setEditingId(null);
    toast({
      title: "Coverage Removed",
      description: "Coverage area has been removed.",
    });
  };

  const startEditCoverage = (area: CoverageArea) => {
    setEditingId(area.id);
    setEditValues({
      standardPrice: area.standardPrice,
      rushPrice: area.rushPrice,
    });
  };

  const saveEditCoverage = (id: string) => {
    if (!editValues.standardPrice || !editValues.rushPrice) {
      toast({
        title: "Invalid Pricing",
        description: "Please enter both standard and rush pricing.",
        variant: "destructive",
      });
      return;
    }

    setCoverageAreas(prev => prev.map(area => 
      area.id === id 
        ? { ...area, standardPrice: editValues.standardPrice, rushPrice: editValues.rushPrice }
        : area
    ));
    setEditingId(null);
    setEditValues({ standardPrice: "", rushPrice: "" });
    toast({
      title: "Pricing Updated",
      description: "Coverage area pricing has been updated.",
    });
  };

  const cancelEditCoverage = () => {
    setEditingId(null);
    setEditValues({ standardPrice: "", rushPrice: "" });
  };

  const exportToCSV = () => {
    // Mock user data - in real app this would come from auth context
    const fieldRepName = "John Smith"; // This should come from user profile/auth
    
    const headers = [
      "Field Rep Name",
      "State",
      "State Code", 
      "Counties",
      "Standard Pricing",
      "Rush Pricing"
    ];
    
    const rows = coverageAreas.map(area => [
      fieldRepName,
      area.state,
      area.stateCode,
      area.counties.length === 1 && area.counties[0] === "All Counties" 
        ? "All Counties" 
        : area.counties.join("; "),
      area.standardPrice,
      area.rushPrice
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${fieldRepName.replace(/\s+/g, '_')}_Coverage_Areas.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Coverage areas have been exported to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Coverage Areas & Pricing</h3>
        <div className="text-xs bg-destructive/10 px-2 py-1 rounded">Confidential - Other Field Reps do NOT have access to these details</div>
      </div>
      
      <div className="border border-border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">Add Coverage Area</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select State</Label>
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
        </div>

        {selectedState && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Select Counties</Label>
              
              <div className="border border-border rounded-lg p-3 max-h-60 overflow-y-auto">
                {/* Select All Counties - Always First */}
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border">
                  <Checkbox 
                    id="all-counties"
                    checked={selectAllCounties}
                    onCheckedChange={handleSelectAllCounties}
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
                          onCheckedChange={(checked) => 
                            handleCountyToggle(county.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={county.id} className="text-sm">
                          {county.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Standard Pricing</Label>
                <Input 
                  placeholder="$35"
                  value={standardPrice}
                  onChange={(e) => setStandardPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rush Pricing</Label>
                <Input 
                  placeholder="$55"
                  value={rushPrice}
                  onChange={(e) => setRushPrice(e.target.value)}
                />
              </div>
            </div>

            <Button type="button" onClick={addCoverageArea} className="w-full">
              Save Coverage Area
            </Button>
          </div>
        )}
      </div>

      {/* Coverage Areas Table */}
      {coverageAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Coverage Areas</h4>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          {/* Pricing Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Pricing Disclaimer</p>
                <p>
                  The pricing listed below is for vendor reference only and does not guarantee payment rates. 
                  All pricing agreements must be finalized directly between you and the vendor you are connecting with. 
                  These rates assist vendors in finding field representatives in their coverage areas.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Counties</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Rush</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverageAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.stateCode}</TableCell>
                    <TableCell>
                      {area.counties.length === 1 && area.counties[0] === "All Counties" 
                        ? "All Counties" 
                        : area.counties.join(", ")
                      }
                    </TableCell>
                    <TableCell>
                      {editingId === area.id ? (
                        <Input
                          value={editValues.standardPrice}
                          onChange={(e) => setEditValues(prev => ({ ...prev, standardPrice: e.target.value }))}
                          placeholder="$35"
                          className="w-20"
                        />
                      ) : (
                        area.standardPrice
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === area.id ? (
                        <Input
                          value={editValues.rushPrice}
                          onChange={(e) => setEditValues(prev => ({ ...prev, rushPrice: e.target.value }))}
                          placeholder="$55"
                          className="w-20"
                        />
                      ) : (
                        area.rushPrice
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingId === area.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEditCoverage(area.id)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditCoverage}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditCoverage(area)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCoverageArea(area.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
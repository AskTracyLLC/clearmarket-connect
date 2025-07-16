import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Info, Plus, Download } from "lucide-react";
import { useStates, useCountiesByState, type State } from "@/hooks/useLocationData";
import { useToast } from "@/hooks/use-toast";
import { CoverageArea, InspectionTypePricing } from "./types";

interface CoverageAreasProps {
  coverageAreas: CoverageArea[];
  setCoverageAreas: React.Dispatch<React.SetStateAction<CoverageArea[]>>;
}

const INSPECTION_TYPES = [
  "Appt-Based",
  "REO",
  "Preservation",
  "Maintenance",
  "Occupancy",
  "Interior",
  "Drive-By",
  "Insurance"
];

export const CoverageAreas = ({ coverageAreas, setCoverageAreas }: CoverageAreasProps) => {
  const { toast } = useToast();
  const { states } = useStates();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const { counties } = useCountiesByState(selectedState?.code);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectAllCounties, setSelectAllCounties] = useState(false);
  const [standardPrice, setStandardPrice] = useState("");
  const [rushPrice, setRushPrice] = useState("");
  const [inspectionTypes, setInspectionTypes] = useState<InspectionTypePricing[]>([]);

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
      if (selectedState && newSelectedCounties.length === counties.length) {
        setSelectAllCounties(true);
      }
    } else {
      setSelectedCounties(prev => prev.filter(id => id !== countyId));
      setSelectAllCounties(false);
    }
  };

  const addInspectionType = () => {
    const newInspectionType: InspectionTypePricing = {
      id: `inspection-${Date.now()}`,
      inspectionType: "",
      price: "",
    };
    setInspectionTypes(prev => [...prev, newInspectionType]);
  };

  const updateInspectionType = (id: string, field: keyof InspectionTypePricing, value: string) => {
    setInspectionTypes(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeInspectionType = (id: string) => {
    setInspectionTypes(prev => prev.filter(item => item.id !== id));
  };

  const addCoverageArea = () => {
    if (!selectedState || selectedCounties.length === 0 || !standardPrice || !rushPrice) {
      toast({
        title: "Missing Information",
        description: "Please select a state, counties, and enter both standard and rush pricing.",
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
      inspectionTypes: inspectionTypes.filter(item => item.inspectionType && item.price),
    };

    setCoverageAreas(prev => [...prev, newCoverage]);
    setSelectedState(null);
    setSelectedCounties([]);
    setSelectAllCounties(false);
    setStandardPrice("");
    setRushPrice("");
    setInspectionTypes([]);
    
    toast({
      title: "Coverage Added",
      description: "Coverage area and pricing have been saved.",
    });
  };

  const removeCoverageArea = (id: string) => {
    setCoverageAreas(prev => prev.filter(area => area.id !== id));
    toast({
      title: "Coverage Removed",
      description: "Coverage area has been removed.",
    });
  };

  const exportToCSV = () => {
    const fieldRepName = "John Smith";
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const dateString = `${month}${day}${year}`;
    
    const headers = [
      "Field Rep Name",
      "State",
      "State Code", 
      "Counties",
      "Standard Pricing",
      "Rush Pricing",
      "Inspection Types"
    ];
    
    const rows = coverageAreas.map(area => [
      fieldRepName,
      area.state,
      area.stateCode,
      area.counties.length === 1 && area.counties[0] === "All Counties" 
        ? "All Counties" 
        : area.counties.join("; "),
      area.standardPrice,
      area.rushPrice,
      area.inspectionTypes.map(it => `${it.inspectionType}: ${it.price}`).join("; ")
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${fieldRepName.replace(/\s+/g, '_')}_Coverage_Areas_asof${dateString}.csv`);
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
        
        <div className="space-y-2">
          <Label>Select State</Label>
          <Select onValueChange={handleStateChange}>
            <SelectTrigger className="w-full md:w-64">
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
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Select Counties</Label>
              
              <div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
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

            {/* Single Row Pricing Layout */}
            <div className="space-y-3">
              <Label>Pricing</Label>
              <div className="grid grid-cols-3 gap-3">
                {/* Standard Pricing */}
                <div className="space-y-2">
                  <Label className="text-sm">Standard</Label>
                  <Input 
                    placeholder="$35"
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                {/* Rush Pricing */}
                <div className="space-y-2">
                  <Label className="text-sm">Rush</Label>
                  <Input 
                    placeholder="$55"
                    value={rushPrice}
                    onChange={(e) => setRushPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                {/* Inspection Type Pricing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Insp Type</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={addInspectionType}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {inspectionTypes.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <Select 
                          value={item.inspectionType} 
                          onValueChange={(value) => updateInspectionType(item.id, 'inspectionType', value)}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSPECTION_TYPES.filter(type => 
                              !inspectionTypes.some(existing => existing.inspectionType === type && existing.id !== item.id)
                            ).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Input 
                            placeholder="$45"
                            value={item.price}
                            onChange={(e) => updateInspectionType(item.id, 'price', e.target.value)}
                            className="text-xs h-8"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInspectionType(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button type="button" onClick={addCoverageArea} className="w-full">
              Save Coverage Area
            </Button>
          </div>
        )}
      </div>

      {/* Coverage Areas Display */}
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Pricing Disclaimer</p>
                <p>
                  The pricing listed below is for vendor reference only and does not guarantee payment rates. 
                  All pricing agreements must be finalized directly between you and the vendor you are connecting with.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid gap-3">
            {coverageAreas.map((area) => (
              <Card key={area.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {area.stateCode} - {area.counties.length === 1 && area.counties[0] === "All Counties" 
                        ? "All Counties" 
                        : area.counties.length > 3 
                          ? `${area.counties.slice(0, 3).join(", ")} +${area.counties.length - 3} more`
                          : area.counties.join(", ")
                      }
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoverageArea(area.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Standard:</span> {area.standardPrice}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rush:</span> {area.rushPrice}
                    </div>
                  </div>
                  {area.inspectionTypes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-2">Inspection Types:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {area.inspectionTypes.map((type) => (
                          <div key={type.id}>
                            <span className="text-muted-foreground">{type.inspectionType}:</span> {type.price}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
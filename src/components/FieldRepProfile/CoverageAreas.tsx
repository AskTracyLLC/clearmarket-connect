import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Info, Plus, Download, Pencil } from "lucide-react";
import { useStates, useCountiesByState, type State } from "@/hooks/useLocationData";
import { useToast } from "@/hooks/use-toast";
import { CoverageArea, InspectionTypePricing } from "./types";

interface CoverageAreasProps {
  coverageAreas: CoverageArea[];
  setCoverageAreas: React.Dispatch<React.SetStateAction<CoverageArea[]>>;
  selectedInspectionTypes?: string[];
  onSaveCoverageAreas: (areas: CoverageArea[]) => Promise<void>;
  fieldRepName?: string;
}

export const CoverageAreas = ({ coverageAreas, setCoverageAreas, selectedInspectionTypes = [], onSaveCoverageAreas, fieldRepName }: CoverageAreasProps) => {
  const { toast } = useToast();
  const { states, loading: statesLoading } = useStates();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const { counties } = useCountiesByState(selectedState?.code);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectAllCounties, setSelectAllCounties] = useState(false);
  const [standardPrice, setStandardPrice] = useState("");
  const [rushPrice, setRushPrice] = useState("");
  const [inspectionTypes, setInspectionTypes] = useState<InspectionTypePricing[]>([]);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  // Create a mapping from profile inspection types to coverage area inspection types
  const getAvailableInspectionTypes = () => {
    const typeMapping: Record<string, string> = {
      "Interior/Exterior Inspections": "Interior",
      "Exterior Only Inspections": "Exterior", 
      "Drive-by Inspections": "Drive-By",
      "Occupancy Verification": "Occupancy",
      "REO Services": "REO",
      "Property Preservation": "Preservation",
      "Damage Assessment": "Maintenance",
      "High Quality Marketing Photos": "Marketing",
      "Appt-Based Inspections": "Appt-Based"
    };

    // If no inspection types selected in profile, show all available types
    if (!selectedInspectionTypes || selectedInspectionTypes.length === 0) {
      return Object.values(typeMapping).filter((type, index, array) => array.indexOf(type) === index);
    }

    // Filter available types based on what's selected in the profile
    return selectedInspectionTypes
      .map(profileType => typeMapping[profileType])
      .filter(Boolean) // Remove undefined values
      .filter((type, index, array) => array.indexOf(type) === index); // Remove duplicates
  };

  const availableInspectionTypes = getAvailableInspectionTypes();

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

  const editCoverageArea = (area: CoverageArea) => {
    // Find the state object
    const state = states.find(s => s.code === area.stateCode);
    setSelectedState(state || null);
    
    // Set if all counties selected
    const isAllCounties = area.counties.includes("All Counties");
    setSelectAllCounties(isAllCounties);
    
    // Convert county names back to IDs
    if (!isAllCounties) {
      const countyIds = area.counties
        .map(countyName => counties.find(c => c.name === countyName)?.id)
        .filter(Boolean) as string[];
      setSelectedCounties(countyIds);
    } else {
      setSelectedCounties([]);
    }
    
    setStandardPrice(area.standardPrice || "");
    setRushPrice(area.rushPrice || "");
    setInspectionTypes(area.inspectionTypes || []);
    setEditingAreaId(area.id);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCoverageArea = async () => {
    if (!selectedState || selectedCounties.length === 0 || !standardPrice || !rushPrice) {
      toast({
        title: "Missing Information",
        description: "Please select a state, counties, and enter both standard and rush pricing.",
        variant: "destructive",
      });
      return;
    }

    const coverageData: CoverageArea = {
      id: editingAreaId || `${selectedState.code}-${Date.now()}`,
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

    const updatedAreas = editingAreaId
      ? coverageAreas.map(area => area.id === editingAreaId ? coverageData : area)
      : [...coverageAreas, coverageData];
    setCoverageAreas(updatedAreas);
    
    try {
      await onSaveCoverageAreas(updatedAreas);
      
      setSelectedState(null);
      setSelectedCounties([]);
      setSelectAllCounties(false);
      setStandardPrice("");
      setRushPrice("");
      setInspectionTypes([]);
      setEditingAreaId(null);
      
      toast({
        title: editingAreaId ? "Coverage Updated" : "Coverage Saved",
        description: editingAreaId 
          ? "Coverage area has been updated in the database."
          : "Coverage area and pricing have been saved to the database.",
      });
    } catch (error) {
      // Rollback on error
      setCoverageAreas(coverageAreas);
      toast({
        title: "Save Failed",
        description: "Failed to save coverage area. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const updatedAreas = coverageAreas.map((area) =>
      area.id === id ? { ...area, isAvailable: !currentStatus } : area
    );
    setCoverageAreas(updatedAreas);
    await onSaveCoverageAreas(updatedAreas);
  };

  const removeCoverageArea = async (id: string) => {
    const updatedAreas = coverageAreas.filter(area => area.id !== id);
    setCoverageAreas(updatedAreas);
    
    try {
      await onSaveCoverageAreas(updatedAreas);
      toast({
        title: "Coverage Removed",
        description: "Coverage area has been removed from the database.",
      });
    } catch (error) {
      // Rollback on error
      setCoverageAreas(coverageAreas);
      toast({
        title: "Remove Failed",
        description: "Failed to remove coverage area. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const repName = fieldRepName || "Field_Rep";
    const sanitizedName = repName.replace(/\s+/g, "_");
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
      repName,
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
    link.setAttribute("download", `${sanitizedName}_Coverage_Areas_asof${dateString}.csv`);
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
        <h4 className="font-medium">{editingAreaId ? "Edit Coverage Area" : "Add Coverage Area"}</h4>
        
        <div className="space-y-2">
          <Label>Select State</Label>
          {statesLoading || states.length === 0 ? (
            <div className="p-3 border rounded-md bg-muted text-muted-foreground">
              Loading states...
            </div>
          ) : states.length > 0 ? (
            <Select value={selectedState?.code || ""} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Choose a state" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {states.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
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
              <div className="flex gap-3">
                {/* Standard Pricing */}
                <div className="flex-1 space-y-2">
                  <Label className="text-sm">Standard</Label>
                  <Input 
                    placeholder="$35"
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                {/* Rush Pricing */}
                <div className="flex-1 space-y-2">
                  <Label className="text-sm">Rush</Label>
                  <Input 
                    placeholder="$55"
                    value={rushPrice}
                    onChange={(e) => setRushPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                {/* Inspection Type Pricing */}
                {inspectionTypes.map((item, index) => (
                  <div key={item.id} className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Insp Type</Label>
                      {index === inspectionTypes.length - 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={addInspectionType}
                          className="h-4 w-4 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Select 
                      value={item.inspectionType} 
                      onValueChange={(value) => updateInspectionType(item.id, 'inspectionType', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                       <SelectContent className="bg-popover z-50">
                         {availableInspectionTypes.length === 0 ? (
                           <SelectItem value="none" disabled>
                             No inspection types available - add them in Profile tab
                           </SelectItem>
                         ) : (
                           availableInspectionTypes.filter(type => 
                             !inspectionTypes.some(existing => existing.inspectionType === type && existing.id !== item.id)
                           ).map((type) => (
                             <SelectItem key={type} value={type}>
                               {type}
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Input 
                        placeholder="$45"
                        value={item.price}
                        onChange={(e) => updateInspectionType(item.id, 'price', e.target.value)}
                        className="text-sm"
                      />
                      {inspectionTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInspectionType(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add first inspection type if none exist */}
                {inspectionTypes.length === 0 && (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Insp Type</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={addInspectionType}
                        className="h-4 w-4 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Select disabled>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </Select>
                    <Input 
                      placeholder="$45"
                      disabled
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="button" onClick={addCoverageArea} className="w-full">
              {editingAreaId ? "Update Coverage Area" : "Save Coverage Area"}
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
          
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Counties</TableHead>
                  <TableHead className="w-24">Standard</TableHead>
                  <TableHead className="w-24">Rush</TableHead>
                  <TableHead>Inspection Types</TableHead>
                  <TableHead className="w-32">Availability</TableHead>
                  <TableHead className="w-20"></TableHead>
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
                    <TableCell>${area.standardPrice}</TableCell>
                    <TableCell>${area.rushPrice}</TableCell>
                    <TableCell>
                      {area.inspectionTypes.length > 0 ? (
                        <div className="text-sm space-y-0.5">
                          {area.inspectionTypes.map((type) => (
                            <div key={type.id} className="text-muted-foreground">
                              {type.inspectionType}: ${type.price}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={area.isAvailable ?? true}
                          onCheckedChange={() => toggleAvailability(area.id, area.isAvailable ?? true)}
                        />
                        <span className={`text-sm font-medium ${area.isAvailable ?? true ? 'text-green-600' : 'text-red-600'}`}>
                          {area.isAvailable ?? true ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editCoverageArea(area)}
                          className="h-8 w-8 p-0 text-primary hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoverageArea(area.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

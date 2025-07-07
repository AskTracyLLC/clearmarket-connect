import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Shield, Info, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { statesAndCounties, type State, type County } from "@/data/statesAndCounties";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const fieldRepSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  displayUsername: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  aspenGroveId: z.string().optional(),
  aspenGroveExpiration: z.date().optional(),
  platforms: z.array(z.string()),
  inspectionTypes: z.array(z.string()),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  clearVueBeta: z.boolean().default(false),
});

type FieldRepFormData = z.infer<typeof fieldRepSchema>;

interface CoverageArea {
  id: string;
  state: string;
  stateCode: string;
  counties: string[];
  standardPrice: string;
  rushPrice: string;
}

const FieldRepProfile = () => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectAllCounties, setSelectAllCounties] = useState(false);
  const [standardPrice, setStandardPrice] = useState("");
  const [rushPrice, setRushPrice] = useState("");
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ standardPrice: string; rushPrice: string }>({ standardPrice: "", rushPrice: "" });

  const form = useForm<FieldRepFormData>({
    resolver: zodResolver(fieldRepSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayUsername: "",
      phone: "",
      email: "",
      aspenGroveId: "",
      platforms: [],
      inspectionTypes: [],
      bio: "",
      clearVueBeta: false,
    },
  });

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleStateChange = (stateCode: string) => {
    const state = statesAndCounties.find(s => s.code === stateCode);
    setSelectedState(state || null);
    setSelectedCounties([]);
    setSelectAllCounties(false);
  };

  const handleSelectAllCounties = (checked: boolean) => {
    setSelectAllCounties(checked);
    if (checked && selectedState) {
      setSelectedCounties(selectedState.counties.map(c => c.id));
    } else {
      setSelectedCounties([]);
    }
  };

  const handleCountyToggle = (countyId: string, checked: boolean) => {
    if (checked) {
      setSelectedCounties(prev => [...prev, countyId]);
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
            selectedState.counties.find(c => c.id === id)?.name || ""
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

  const onSubmit = (data: FieldRepFormData) => {
    if (coverageAreas.length === 0) {
      toast({
        title: "Missing Coverage Areas",
        description: "Please add at least one coverage area with pricing.",
        variant: "destructive",
      });
      return;
    }

    console.log("Field Rep Profile Data:", { ...data, coverageAreas });
    toast({
      title: "Profile Created",
      description: "Your Field Rep profile has been successfully created!",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Field Rep Profile Setup
          </CardTitle>
          <CardDescription>
            Create your profile to connect with vendors seeking coverage in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="text-xs bg-muted px-2 py-1 rounded">Private</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Display Identity Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Display Identity</h3>
                  <div className="text-xs bg-accent px-2 py-1 rounded">Public</div>
                </div>
                
                <FormField
                  control={form.control}
                  name="displayUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Username</FormLabel>
                      <FormControl>
                        <Input placeholder="ProInspector123" {...field} />
                      </FormControl>
                      <FormDescription className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          Since this is a fresh platform, you can establish yourself under an alias until you become a "Trusted Field Rep". 
                          This allows you to build your reputation without preconceived notions.
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Verification Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Contact Verification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567"
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={14}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Background Check Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">AspenGrove Background Check</h3>
                  <div className="text-xs bg-primary/10 px-2 py-1 rounded">Optional - Unlocks Premium Jobs</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aspenGroveId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AspenGrove ID</FormLabel>
                        <FormControl>
                          <Input placeholder="AG123456789" {...field} />
                        </FormControl>
                        <FormDescription>
                          Network level background check ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="aspenGroveExpiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick expiration date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Coverage Areas & Pricing Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Coverage Areas & Pricing</h3>
                  <div className="text-xs bg-destructive/10 px-2 py-1 rounded">Confidential - Credit Required for Vendors</div>
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
                          {statesAndCounties.map((state) => (
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
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="all-counties"
                            checked={selectAllCounties}
                            onCheckedChange={handleSelectAllCounties}
                          />
                          <Label htmlFor="all-counties" className="font-medium">
                            All Counties
                          </Label>
                        </div>
                        
                        {!selectAllCounties && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                            {selectedState.counties.map((county) => (
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
                        )}
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
                    <h4 className="font-medium">Your Coverage Areas</h4>
                    
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
                              <TableCell className="font-medium">{area.state}</TableCell>
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

              {/* Platforms Used */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Platforms Used</h3>
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["EZ", "IA", "Property Matrix", "CoreLogic", "Other"].map((platform) => (
                          <FormField
                            key={platform}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={platform}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(platform)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, platform])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== platform
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {platform}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Inspection Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Inspection Types</h3>
                <FormField
                  control={form.control}
                  name="inspectionTypes"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Interior/Exterior",
                          "Exterior Only", 
                          "Drive-by",
                          "Occupancy Check",
                          "REO Trash Out",
                          "Property Preservation"
                        ].map((type) => (
                          <FormField
                            key={type}
                            control={form.control}
                            name="inspectionTypes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={type}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, type])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== type
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {type}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Professional Bio */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell vendors about your experience, certifications, and what makes you reliable..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 characters required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ClearVue Beta Interest */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clearVueBeta"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Interested in ClearVue Beta?
                        </FormLabel>
                        <FormDescription>
                          Get early access to our AI-powered inspection tools
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Create Field Rep Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldRepProfile;
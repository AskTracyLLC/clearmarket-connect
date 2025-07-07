import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import { statesAndCounties, type State, type County } from "@/data/statesAndCounties";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyAbbreviation: z.string().min(2, "Abbreviation must be at least 2 characters").max(10, "Abbreviation must be 10 characters or less"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone must be in format (555) 123-4567"),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid website URL"),
  workTypes: z.array(z.string()).min(1, "Please select at least one work type"),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  otherPlatform: z.string().optional(),
  companyBio: z.string().min(50, "Company bio must be at least 50 characters"),
  avgJobs: z.string().min(1, "Please select average jobs per month"),
  paymentTerms: z.string().min(1, "Please select payment terms"),
});

type CoverageArea = {
  id: string;
  state: string;
  stateCode: string;
  counties: string[];
  isAllCounties: boolean;
};

const VendorProfile = () => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [isAllCounties, setIsAllCounties] = useState(true);
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAbbreviation: "",
      phone: "",
      email: "",
      website: "",
      workTypes: [],
      platforms: [],
      otherPlatform: "",
      companyBio: "",
      avgJobs: "",
      paymentTerms: "",
    },
  });

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue("phone", formatted);
  };

  const handleStateChange = (stateCode: string) => {
    const state = statesAndCounties.find(s => s.code === stateCode);
    setSelectedState(state || null);
    setSelectedCounties([]);
    setIsAllCounties(true);
  };

  const handleAllCountiesChange = (checked: boolean) => {
    setIsAllCounties(checked);
    if (checked && selectedState) {
      setSelectedCounties(selectedState.counties.map(c => c.id));
    } else {
      setSelectedCounties([]);
    }
  };

  const handleCountyChange = (countyId: string, checked: boolean) => {
    if (checked) {
      setSelectedCounties(prev => [...prev, countyId]);
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
        ? selectedState.counties.map(c => c.name)
        : selectedCounties.map(id => selectedState.counties.find(c => c.id === id)?.name || ""),
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

  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    const currentWorkTypes = form.getValues("workTypes");
    if (checked) {
      form.setValue("workTypes", [...currentWorkTypes, workType]);
    } else {
      form.setValue("workTypes", currentWorkTypes.filter(type => type !== workType));
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    const currentPlatforms = form.getValues("platforms");
    if (checked) {
      form.setValue("platforms", [...currentPlatforms, platform]);
    } else {
      form.setValue("platforms", currentPlatforms.filter(p => p !== platform));
      if (platform === "Other") {
        form.setValue("otherPlatform", "");
      }
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (coverageAreas.length === 0) {
      toast({
        title: "No Coverage Areas",
        description: "Please add at least one coverage area before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log("Form submitted:", { ...values, coverageAreas });
    toast({
      title: "Profile Created",
      description: "Your vendor profile has been created successfully!",
    });
  };

  const workTypes = [
    "Interior/Exterior Inspections",
    "Exterior Only Inspections", 
    "Drive-by Inspections",
    "Occupancy Verification",
    "REO Services",
    "Property Preservation",
    "Damage Assessment",
    "High Quality Marketing Photos",
    "Appt-Based Inspections"
  ];

  const platforms = [
    "EZinspections",
    "InspectorADE", 
    "SafeView",
    "WorldAPP",
    "Other"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Vendor Profile Setup
          </CardTitle>
          <CardDescription>
            Create your company profile to find reliable field reps in your coverage areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Property Services LLC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyAbbreviation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Abbreviation *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCPS" maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567" 
                            {...field}
                            onChange={handlePhoneChange}
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
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@abcpropertyservices.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Website URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.abcpropertyservices.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Coverage Areas */}
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
                        {statesAndCounties.map((state) => (
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
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="all-counties"
                            checked={isAllCounties}
                            onCheckedChange={handleAllCountiesChange}
                          />
                          <Label htmlFor="all-counties" className="font-medium">
                            ALL COUNTIES
                          </Label>
                        </div>
                        
                        {!isAllCounties && selectedState.counties.map((county) => (
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

              {/* Types of Work */}
              <FormField
                control={form.control}
                name="workTypes"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Types of Work We Assign *</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {workTypes.map((workType) => (
                        <div key={workType} className="flex items-center space-x-2">
                          <Checkbox 
                            id={workType.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                            onCheckedChange={(checked) => handleWorkTypeChange(workType, checked as boolean)}
                          />
                          <Label htmlFor={workType.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                            {workType}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Platforms Used */}
              <FormField
                control={form.control}
                name="platforms"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Platforms We Assign Through *</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {platforms.map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox 
                            id={platform.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                            onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                          />
                          <Label htmlFor={platform.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {form.watch("platforms")?.includes("Other") && (
                      <FormField
                        control={form.control}
                        name="otherPlatform"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Other Platform Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter platform name..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Bio */}
              <FormField
                control={form.control}
                name="companyBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Bio *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell field reps about your company, typical job volume, payment terms, and what makes you a great vendor to work with..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Information */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="avgJobs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Jobs per Month *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-25">1-25 jobs</SelectItem>
                            <SelectItem value="26-50">26-50 jobs</SelectItem>
                            <SelectItem value="51-100">51-100 jobs</SelectItem>
                            <SelectItem value="100+">100+ jobs</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typical Payment Terms *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="net-15">Net 15 days</SelectItem>
                            <SelectItem value="net-30">Net 30 days</SelectItem>
                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Create Vendor Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;
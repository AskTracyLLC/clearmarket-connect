import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, X, DollarSign } from "lucide-react";
import { useStates, useCountiesByState, type State, type County } from "@/hooks/useLocationData";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useWorkTypes } from "@/hooks/useWorkTypes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PostCoverageRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CoverageRequestForm {
  title: string;
  description: string;
  estimatedMonthlyVolume: string;
  budgetMin: string;
  budgetMax: string;
  selectedState: string;
  selectedCounties: string[];
  citiesText: string;
  selectedPlatforms: string[];
  selectedInspectionTypes: string[];
  abcRequired: boolean | null;
  hudKeyRequired: boolean | null;
  yearsExperienceRequired: string;
  hideFromAllNetwork: boolean;
  hideFromCurrentNetwork: boolean;
}

const experienceOptions = [
  "No minimum experience",
  "1+ years",
  "2+ years", 
  "3+ years",
  "5+ years"
];

const PostCoverageRequestModal = ({ open, onOpenChange }: PostCoverageRequestModalProps) => {
  const { states } = useStates();
  const { platforms, loading: platformsLoading } = usePlatforms();
  const { workTypes, loading: workTypesLoading } = useWorkTypes();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CoverageRequestForm>({
    title: "",
    description: "",
    estimatedMonthlyVolume: "",
    budgetMin: "",
    budgetMax: "",
    selectedState: "",
    selectedCounties: [],
    citiesText: "",
    selectedPlatforms: [],
    selectedInspectionTypes: [],
    abcRequired: null,
    hudKeyRequired: null,
    yearsExperienceRequired: "",
    hideFromAllNetwork: false,
    hideFromCurrentNetwork: false,
  });

  const { counties } = useCountiesByState(form.selectedState);
  const selectedStateData = states.find(state => state.code === form.selectedState);

  const handleStateChange = (stateCode: string) => {
    setForm(prev => ({
      ...prev,
      selectedState: stateCode,
      selectedCounties: [],
      citiesText: ""
    }));
  };

  const toggleCounty = (countyId: string) => {
    setForm(prev => ({
      ...prev,
      selectedCounties: prev.selectedCounties.includes(countyId)
        ? prev.selectedCounties.filter(id => id !== countyId)
        : [...prev.selectedCounties, countyId]
    }));
  };

  const togglePlatform = (platform: string) => {
    setForm(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter(p => p !== platform)
        : [...prev.selectedPlatforms, platform]
    }));
  };

  const toggleInspectionType = (type: string) => {
    setForm(prev => ({
      ...prev,
      selectedInspectionTypes: prev.selectedInspectionTypes.includes(type)
        ? prev.selectedInspectionTypes.filter(t => t !== type)
        : [...prev.selectedInspectionTypes, type]
    }));
  };

  const removeCounty = (countyId: string) => {
    setForm(prev => ({
      ...prev,
      selectedCounties: prev.selectedCounties.filter(id => id !== countyId)
    }));
  };

  const removePlatform = (platform: string) => {
    setForm(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.filter(p => p !== platform)
    }));
  };

  const removeInspectionType = (type: string) => {
    setForm(prev => ({
      ...prev,
      selectedInspectionTypes: prev.selectedInspectionTypes.filter(t => t !== type)
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to post a coverage request.",
      });
      return;
    }

    // Validation
    if (!form.title || !form.description || !form.selectedState) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Please fill in title, description, and select a state.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Construct budget range string
      const budgetRange = form.budgetMin && form.budgetMax 
        ? `$${form.budgetMin}-${form.budgetMax} per inspection`
        : form.budgetMin 
          ? `$${form.budgetMin}+ per inspection`
          : "";

      // Parse cities from text input
      const selectedCities = form.citiesText
        .split(',')
        .map(city => city.trim())
        .filter(Boolean);

      const requestData = {
        vendor_user_id: user.id,
        title: form.title,
        description: form.description,
        estimated_monthly_volume: form.estimatedMonthlyVolume,
        budget_range: budgetRange,
        selected_state: form.selectedState,
        selected_counties: form.selectedCounties,
        selected_cities: selectedCities,
        selected_platforms: form.selectedPlatforms,
        selected_inspection_types: form.selectedInspectionTypes,
        abc_required: form.abcRequired,
        hud_key_required: form.hudKeyRequired,
        years_experience_required: form.yearsExperienceRequired,
        hide_from_all_network: form.hideFromAllNetwork,
        hide_from_current_network: form.hideFromCurrentNetwork,
        status: 'active'
      };
      
      // Insert coverage request
      const { data: insertedRequest, error: insertError } = await supabase
        .from('coverage_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Convert county IDs to county names for notification matching
      const countyNames = form.selectedCounties.map(countyId => {
        const county = counties.find(c => c.id === countyId);
        return county?.name || countyId;
      });

      // Call edge function to notify matching field reps
      console.log('Calling notify-coverage-request with:', {
        requestId: insertedRequest.id,
        state: form.selectedState,
        counties: countyNames,
        inspectionTypes: form.selectedInspectionTypes,
        platforms: form.selectedPlatforms
      });

      const { data: notifyResult, error: notifyError } = await supabase.functions.invoke('notify-coverage-request', {
        body: {
          requestId: insertedRequest.id,
          state: form.selectedState,
          counties: countyNames,
          inspectionTypes: form.selectedInspectionTypes,
          platforms: form.selectedPlatforms
        }
      });

      console.log('notify-coverage-request response:', { notifyResult, notifyError });

      if (notifyError) {
        console.error("Error sending notifications:", notifyError);
        toast({
          variant: "destructive",
          title: "Notification Error",
          description: `Request posted but failed to notify field reps: ${notifyError.message}`,
        });
      } else {
        console.log(`Successfully notified ${notifyResult?.notified || 0} field reps`);
      }

      const notifiedCount = notifyResult?.notified || 0;
      toast({
        title: "Coverage Request Posted",
        description: notifiedCount > 0 
          ? `Successfully notified ${notifiedCount} field reps in your area.`
          : "Request posted. Matching field reps will be notified.",
      });
      
      onOpenChange(false);
      
      // Reset form
      setForm({
        title: "",
        description: "",
        estimatedMonthlyVolume: "",
        budgetMin: "",
        budgetMax: "",
        selectedState: "",
        selectedCounties: [],
        citiesText: "",
        selectedPlatforms: [],
        selectedInspectionTypes: [],
        abcRequired: null,
        hudKeyRequired: null,
        yearsExperienceRequired: "",
        hideFromAllNetwork: false,
        hideFromCurrentNetwork: false,
      });
    } catch (error: any) {
      console.error("Error creating coverage request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create coverage request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCountyName = (countyId: string) => {
    return counties.find(c => c.id === countyId)?.name || countyId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post New Coverage Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., BPO Coverage Needed - Downtown LA Area"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your coverage needs, specific requirements, and any important details..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Estimated Monthly Volume *</Label>
                <Input
                  id="volume"
                  value={form.estimatedMonthlyVolume}
                  onChange={(e) => setForm(prev => ({ ...prev, estimatedMonthlyVolume: e.target.value }))}
                  placeholder="e.g., 15-20 inspections per month"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Range (per inspection)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="budgetMin" className="text-xs text-muted-foreground">Minimum $</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      min="0"
                      step="5"
                      value={form.budgetMin}
                      onChange={(e) => setForm(prev => ({ ...prev, budgetMin: e.target.value }))}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="budgetMax" className="text-xs text-muted-foreground">Maximum $</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      min="0"
                      step="5"
                      value={form.budgetMax}
                      onChange={(e) => setForm(prev => ({ ...prev, budgetMax: e.target.value }))}
                      placeholder="35"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Coverage Area
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={form.selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
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

              {selectedStateData && counties.length > 0 && (
                <div className="space-y-2">
                  <Label>Counties</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {counties.map((county) => (
                      <div key={county.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={county.id}
                          checked={form.selectedCounties.includes(county.id)}
                          onCheckedChange={() => toggleCounty(county.id)}
                        />
                        <Label htmlFor={county.id} className="text-sm cursor-pointer">{county.name}</Label>
                      </div>
                    ))}
                  </div>
                  
                  {form.selectedCounties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.selectedCounties.map((countyId) => (
                        <Badge key={countyId} variant="secondary" className="text-xs">
                          {getCountyName(countyId)}
                          <button onClick={() => removeCounty(countyId)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {form.selectedState && (
                <div className="space-y-2">
                  <Label htmlFor="citiesText">Specific Cities (Optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Enter city names separated by commas (e.g., "Las Vegas, Reno, Henderson")
                  </p>
                  <Input
                    id="citiesText"
                    value={form.citiesText}
                    onChange={(e) => setForm(prev => ({ ...prev, citiesText: e.target.value }))}
                    placeholder="Enter cities separated by commas"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  {platformsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading platforms...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {platforms.map((platform) => (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={form.selectedPlatforms.includes(platform.name)}
                            onCheckedChange={() => togglePlatform(platform.name)}
                          />
                          <Label htmlFor={platform.id} className="text-sm cursor-pointer">{platform.name}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {form.selectedPlatforms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.selectedPlatforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                          <button onClick={() => removePlatform(platform)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Inspection Types</Label>
                  {workTypesLoading ? (
                    <div className="text-sm text-muted-foreground">Loading work types...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {workTypes.map((workType) => (
                        <div key={workType.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={workType.id}
                            checked={form.selectedInspectionTypes.includes(workType.name)}
                            onCheckedChange={() => toggleInspectionType(workType.name)}
                          />
                          <Label htmlFor={workType.id} className="text-sm cursor-pointer">{workType.name}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {form.selectedInspectionTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.selectedInspectionTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                          <button onClick={() => removeInspectionType(type)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>ABC# Required</Label>
                    <Select 
                      value={form.abcRequired === null ? "no_preference" : form.abcRequired.toString()} 
                      onValueChange={(value) => setForm(prev => ({ 
                        ...prev, 
                        abcRequired: value === "no_preference" ? null : value === "true" 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_preference">No preference</SelectItem>
                        <SelectItem value="true">Yes, required</SelectItem>
                        <SelectItem value="false">No, not required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>HUD Key Required</Label>
                    <Select 
                      value={form.hudKeyRequired === null ? "no_preference" : form.hudKeyRequired.toString()} 
                      onValueChange={(value) => setForm(prev => ({ 
                        ...prev, 
                        hudKeyRequired: value === "no_preference" ? null : value === "true" 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_preference">No preference</SelectItem>
                        <SelectItem value="true">Yes, required</SelectItem>
                        <SelectItem value="false">No, not required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Required</Label>
                    <Select 
                      value={form.yearsExperienceRequired} 
                      onValueChange={(value) => setForm(prev => ({ ...prev, yearsExperienceRequired: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No minimum" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="min-w-[120px]" disabled={submitting}>
            {submitting ? "Posting..." : "Post Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostCoverageRequestModal;
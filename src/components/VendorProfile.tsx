import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VendorProfile = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Vendor Profile Setup
          </CardTitle>
          <CardDescription>
            Create your company profile to find reliable field reps in your coverage areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="ABC Property Services LLC" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInitials">Contact Initials</Label>
              <Input 
                id="contactInitials" 
                placeholder="J.D." 
                maxLength={4}
                className="w-24"
              />
            </div>
          </div>

          {/* Coverage Areas */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Coverage Areas</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverageStates">States We Cover</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                    <SelectItem value="fl">Florida</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="multi">Multiple States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageCounties">Counties We Cover</Label>
                <Input 
                  id="coverageCounties" 
                  placeholder="Orange, Los Angeles, Riverside..."
                />
              </div>
            </div>
          </div>

          {/* Types of Work */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Types of Work We Assign</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Interior/Exterior Inspections",
                "Exterior Only Inspections", 
                "Drive-by Inspections",
                "Occupancy Verification",
                "REO Services",
                "Property Preservation",
                "Damage Assessment",
                "Compliance Checks"
              ].map((workType) => (
                <div key={workType} className="flex items-center space-x-2">
                  <Checkbox id={workType.toLowerCase().replace(/[^a-z0-9]/g, "-")} />
                  <Label htmlFor={workType.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                    {workType}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms Used */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Platforms We Assign Through</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                "EZ Inspector",
                "Inspection Assistant", 
                "Property Matrix",
                "CoreLogic",
                "Custom Platform",
                "Direct Assignment"
              ].map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox id={platform.toLowerCase().replace(/[^a-z0-9]/g, "-")} />
                  <Label htmlFor={platform.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Company Bio */}
          <div className="space-y-2">
            <Label htmlFor="companyBio">Company Bio</Label>
            <Textarea 
              id="companyBio" 
              placeholder="Tell field reps about your company, typical job volume, payment terms, and what makes you a great vendor to work with..."
              className="min-h-[120px]"
            />
          </div>

          {/* Additional Information */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-foreground">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avgJobs">Average Jobs per Month</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-25">1-25 jobs</SelectItem>
                    <SelectItem value="26-50">26-50 jobs</SelectItem>
                    <SelectItem value="51-100">51-100 jobs</SelectItem>
                    <SelectItem value="100+">100+ jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Typical Payment Terms</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net-15">Net 15 days</SelectItem>
                    <SelectItem value="net-30">Net 30 days</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button variant="hero" size="lg" className="w-full">
              Create Vendor Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FieldRepProfile = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Field Rep Profile Setup
          </CardTitle>
          <CardDescription>
            Create your profile to connect with vendors seeking coverage in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="John" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name Initial</Label>
            <Input id="lastName" placeholder="D" maxLength={1} />
          </div>

          <div className="space-y-2">
            <Label>Display Name Preview</Label>
            <div className="p-3 bg-muted rounded-md text-muted-foreground">
              John D.
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Service Areas</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="states">States</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                    <SelectItem value="fl">Florida</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="counties">Counties</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange">Orange County</SelectItem>
                    <SelectItem value="la">Los Angeles County</SelectItem>
                    <SelectItem value="riverside">Riverside County</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCodes">Zip Codes</Label>
                <Input id="zipCodes" placeholder="90210, 90211, 90212" />
              </div>
            </div>
          </div>

          {/* Platforms Used */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Platforms Used</Label>
            <div className="grid grid-cols-2 gap-3">
              {["EZ", "IA", "Property Matrix", "CoreLogic", "Other"].map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox id={platform.toLowerCase().replace(" ", "-")} />
                  <Label htmlFor={platform.toLowerCase().replace(" ", "-")} className="text-sm">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Inspection Types</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Interior/Exterior",
                "Exterior Only", 
                "Drive-by",
                "Occupancy Check",
                "REO Trash Out",
                "Property Preservation"
              ].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox id={type.toLowerCase().replace(/[^a-z0-9]/g, "-")} />
                  <Label htmlFor={type.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <Label htmlFor="pricing">Pricing per Job</Label>
            <Input 
              id="pricing" 
              placeholder="e.g., $25-35 for exterior, $45-55 for interior/exterior"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea 
              id="bio" 
              placeholder="Tell vendors about your experience, certifications, and what makes you reliable..."
              className="min-h-[100px]"
            />
          </div>

          {/* ClearVue Beta Interest */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="clearvue-beta" className="text-base font-medium">
                Interested in ClearVue Beta?
              </Label>
              <p className="text-sm text-muted-foreground">
                Get early access to our AI-powered inspection tools
              </p>
            </div>
            <Switch id="clearvue-beta" />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button variant="hero" size="lg" className="w-full">
              Create Field Rep Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldRepProfile;
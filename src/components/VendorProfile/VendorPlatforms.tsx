import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { VendorFormData } from "./types";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useToast } from "@/hooks/use-toast";

interface VendorPlatformsProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorPlatforms = ({ form }: VendorPlatformsProps) => {
  const { platforms, loading } = usePlatforms();
  const { saveProfile } = useVendorProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handlePlatformChange = (platformName: string, checked: boolean) => {
    const currentPlatforms = form.getValues("platforms");
    if (checked) {
      form.setValue("platforms", [...currentPlatforms, platformName]);
    } else {
      form.setValue("platforms", currentPlatforms.filter(p => p !== platformName));
      if (platformName === "Other") {
        form.setValue("otherPlatform", "");
      }
    }
  };

  const handleSavePlatforms = async () => {
    if (isSaving) return;
    
    const platforms = form.getValues("platforms");
    const otherPlatform = form.getValues("otherPlatform");
    
    if (platforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({
        platforms,
        other_platform: otherPlatform,
      });
      
      toast({
        title: "Platforms Saved",
        description: "Your platform preferences have been saved successfully!",
      });
    } catch (error: any) {
      console.error('Save platforms error:', error);
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save platforms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <FormItem>
        <FormLabel className="text-base font-semibold">Platforms We Assign Through *</FormLabel>
        <div className="text-sm text-muted-foreground">Loading platforms...</div>
      </FormItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name="platforms"
      render={() => (
        <FormItem>
          <div className="flex items-center justify-between mb-4">
            <FormLabel className="text-base font-semibold">Platforms We Assign Through *</FormLabel>
            <Button
              type="button"
              onClick={handleSavePlatforms}
              disabled={isSaving}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={platform.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                  onCheckedChange={(checked) => handlePlatformChange(platform.name, checked as boolean)}
                />
                <Label htmlFor={platform.name.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                  {platform.name}
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
  );
};
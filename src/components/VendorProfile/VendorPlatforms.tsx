import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VendorFormData } from "./types";
import { usePlatforms } from "@/hooks/usePlatforms";

interface VendorPlatformsProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorPlatforms = ({ form }: VendorPlatformsProps) => {
  const { platforms, loading } = usePlatforms();
  
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
          <FormLabel className="text-base font-semibold">Platforms We Assign Through *</FormLabel>
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
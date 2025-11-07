import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useState } from "react";
import { useFieldRepProfile } from "@/hooks/useFieldRepProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PlatformsUsedProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const PlatformsUsed = ({ form }: PlatformsUsedProps) => {
  const { platforms, loading } = usePlatforms();
  const selectedPlatforms = form.watch("platforms") || [];
  const isOtherSelected = selectedPlatforms.includes("Other");
  const { saveProfile } = useFieldRepProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlatforms = async () => {
    if (isSaving || !user) return;
    setIsSaving(true);
    try {
      await saveProfile({
        platforms: form.watch("platforms"),
        other_platform: form.watch("otherPlatform"),
      });
      toast({
        title: "Platforms Saved",
        description: "Your platform preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save platforms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading platforms...</div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="platforms"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <FormField
                  key={platform.id}
                  control={form.control}
                  name="platforms"
                  render={({ field }) => {
                    const currentValue = field.value || [];
                    return (
                      <FormItem
                        key={platform.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                           <Checkbox
                            checked={currentValue.includes(platform.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...currentValue, platform.name])
                              } else {
                                field.onChange(
                                  currentValue.filter(
                                    (value) => value !== platform.name
                                  )
                                )
                                if (platform.name === "Other") {
                                  form.setValue("otherPlatform", "")
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {platform.name}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            
            {isOtherSelected && (
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
      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSavePlatforms}
          size="sm"
          variant="outline"
          disabled={isSaving}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};
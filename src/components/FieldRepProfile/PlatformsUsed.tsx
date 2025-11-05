import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { usePlatforms } from "@/hooks/usePlatforms";
import { Save } from "lucide-react";
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Platforms Used</h3>
        <div className="text-sm text-muted-foreground">Loading platforms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Platforms Used</h3>
        <Button
          onClick={handleSavePlatforms}
          size="sm"
          variant="outline"
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
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
    </div>
  );
};
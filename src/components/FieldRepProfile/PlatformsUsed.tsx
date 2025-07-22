import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { usePlatforms } from "@/hooks/usePlatforms";

interface PlatformsUsedProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const PlatformsUsed = ({ form }: PlatformsUsedProps) => {
  const { getPlatformNames, loading } = usePlatforms();
  const platforms = getPlatformNames();
  const selectedPlatforms = form.watch("platforms") || [];
  const isOtherSelected = selectedPlatforms.includes("Other");

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
      <h3 className="text-lg font-semibold">Platforms Used</h3>
      <FormField
        control={form.control}
        name="platforms"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
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
                              if (checked) {
                                field.onChange([...field.value, platform])
                              } else {
                                field.onChange(
                                  field.value?.filter(
                                    (value) => value !== platform
                                  )
                                )
                                if (platform === "Other") {
                                  form.setValue("otherPlatform", "")
                                }
                              }
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
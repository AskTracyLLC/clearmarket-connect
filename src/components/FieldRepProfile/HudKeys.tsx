import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface HudKeysProps {
  form: UseFormReturn<FieldRepFormData>;
}

const hudKeyOptions = [
  "35241",
  "35453", 
  "44535",
  "64445",
  "67767",
  "76667",
  "A-389"
];

export const HudKeys = ({ form }: HudKeysProps) => {
  const watchedHudKeys = form.watch("hudKeys") || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">HUD Keys (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Do you have HUD keys? Select the ones you own. Vendors may reference specific HUD keys when looking for coverage.
        </p>
      </div>

      <FormField
        control={form.control}
        name="hudKeys"
        render={() => (
          <FormItem>
            <FormLabel>Available HUD Keys</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hudKeyOptions.map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name="hudKeys"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={key}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(key)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), key])
                                : field.onChange(
                                    field.value?.filter((value) => value !== key)
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {key}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="otherHudKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other HUD Key</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter additional HUD key (alphanumeric)"
                {...field}
              />
            </FormControl>
            <FormDescription>
              If you have a HUD key not listed above, enter it here
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
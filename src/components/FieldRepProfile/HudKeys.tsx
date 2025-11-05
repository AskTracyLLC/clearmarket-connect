import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface HudKeysProps {
  form: UseFormReturn<FieldRepFormData>;
}

const hudKeyOptions = [
  "None",
  "35241",
  "35453", 
  "44535",
  "64445",
  "67767",
  "76667",
  "A-389"
];

export const HudKeys = ({ form }: HudKeysProps) => {
  const hasHudKeys = form.watch("hasHudKeys");
  const watchedHudKeys = form.watch("hudKeys") || [];

  const handleHasHudKeysChange = (checked: boolean) => {
    form.setValue('hasHudKeys', checked);
    if (!checked) {
      // Clear all HUD key fields when "No" is selected
      form.setValue('hudKeys', []);
      form.setValue('otherHudKey', '');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">HUD Keys</h3>
        <p className="text-sm text-muted-foreground">
          Vendors may reference specific HUD keys when looking for coverage.
        </p>
      </div>

      {/* Yes/No Question */}
      <FormField
        control={form.control}
        name="hasHudKeys"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base">Do you have HUD Keys?</FormLabel>
            <FormControl>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={field.value === true}
                    onChange={() => handleHasHudKeysChange(true)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={field.value === false}
                    onChange={() => handleHasHudKeysChange(false)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Only show HUD key selection if user has them */}
      {hasHudKeys && (
        <>

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
                    const currentValue = field.value || [];
                    return (
                      <FormItem
                        key={key}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={currentValue.includes(key)}
                            onCheckedChange={(checked) => {
                              if (key === "None") {
                                // If None is checked, clear all other selections
                                return checked ? field.onChange(["None"]) : field.onChange([]);
                              } else {
                                // If any other key is checked, remove None
                                const withoutNone = currentValue.filter(v => v !== "None");
                                return checked
                                  ? field.onChange([...withoutNone, key])
                                  : field.onChange(withoutNone.filter((value) => value !== key));
                              }
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
      </>
      )}
    </div>
  );
};
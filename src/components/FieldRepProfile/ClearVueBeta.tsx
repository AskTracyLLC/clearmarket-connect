import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface ClearVueBetaProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const ClearVueBeta = ({ form }: ClearVueBetaProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="clearVueBeta"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Interested in ClearVue Beta?
              </FormLabel>
              <FormDescription>
                Get early access to our AI-powered inspection tools
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
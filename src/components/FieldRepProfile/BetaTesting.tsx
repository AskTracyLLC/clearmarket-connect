import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface BetaTestingProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const BetaTesting = ({ form }: BetaTestingProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="interestedInBeta"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Join Our Beta Testing Program
              </FormLabel>
              <FormDescription>
                Get early access to new features and help shape the future of ClearMarket
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
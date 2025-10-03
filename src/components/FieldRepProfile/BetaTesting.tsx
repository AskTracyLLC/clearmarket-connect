import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
interface BetaTestingProps {
  form: UseFormReturn<FieldRepFormData>;
}
export const BetaTesting = ({
  form
}: BetaTestingProps) => {
  return <div className="space-y-4">
      <FormField control={form.control} name="interestedInBeta" render={({
      field
    }) => {}} />
    </div>;
};
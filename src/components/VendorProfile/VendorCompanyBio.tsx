import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VendorFormData } from "./types";

interface VendorCompanyBioProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorCompanyBio = ({ form }: VendorCompanyBioProps) => {
  return (
    <FormField
      control={form.control}
      name="companyBio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Bio *</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Tell field reps about your company, typical job volume, payment terms, and what makes you a great vendor to work with..."
              className="min-h-[120px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
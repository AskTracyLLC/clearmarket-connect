import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorFormData } from "./types";

interface VendorAdditionalInfoProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorAdditionalInfo = ({ form }: VendorAdditionalInfoProps) => {
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-medium text-foreground">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="avgJobs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Average Jobs per Month *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-25">1-25 jobs</SelectItem>
                  <SelectItem value="26-50">26-50 jobs</SelectItem>
                  <SelectItem value="51-100">51-100 jobs</SelectItem>
                  <SelectItem value="100+">100+ jobs</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typical Payment Terms *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="net-15">Net 15 days</SelectItem>
                  <SelectItem value="net-30">Net 30 days</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
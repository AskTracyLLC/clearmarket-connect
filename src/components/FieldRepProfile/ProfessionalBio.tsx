import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface ProfessionalBioProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const ProfessionalBio = ({ form }: ProfessionalBioProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Bio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell vendors about your experience, certifications, and what makes you reliable..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Minimum 50 characters required
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
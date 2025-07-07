import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { VendorFormData } from "./types";
import { workTypes } from "./utils";

interface VendorWorkTypesProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorWorkTypes = ({ form }: VendorWorkTypesProps) => {
  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    const currentWorkTypes = form.getValues("workTypes");
    if (checked) {
      form.setValue("workTypes", [...currentWorkTypes, workType]);
    } else {
      form.setValue("workTypes", currentWorkTypes.filter(type => type !== workType));
    }
  };

  return (
    <FormField
      control={form.control}
      name="workTypes"
      render={() => (
        <FormItem>
          <FormLabel className="text-base font-semibold">Types of Work We Assign *</FormLabel>
          <div className="grid grid-cols-2 gap-3">
            {workTypes.map((workType) => (
              <div key={workType} className="flex items-center space-x-2">
                <Checkbox 
                  id={workType.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                  onCheckedChange={(checked) => handleWorkTypeChange(workType, checked as boolean)}
                />
                <Label htmlFor={workType.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                  {workType}
                </Label>
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
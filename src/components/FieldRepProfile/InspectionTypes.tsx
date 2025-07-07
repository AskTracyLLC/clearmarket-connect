import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface InspectionTypesProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const InspectionTypes = ({ form }: InspectionTypesProps) => {
  const inspectionTypes = [
    "Interior/Exterior Inspections",
    "Exterior Only Inspections", 
    "Drive-by Inspections",
    "Occupancy Verification",
    "REO Services",
    "Property Preservation",
    "Damage Assessment",
    "High Quality Marketing Photos",
    "Appt-Based Inspections"
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Inspection Types</h3>
      <FormField
        control={form.control}
        name="inspectionTypes"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-2 gap-3">
              {inspectionTypes.map((type) => (
                <FormField
                  key={type}
                  control={form.control}
                  name="inspectionTypes"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={type}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(type)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, type])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== type
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {type}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
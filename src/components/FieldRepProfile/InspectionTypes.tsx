import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { useWorkTypes } from "@/hooks/useWorkTypes";
import { useState } from "react";
import { useFieldRepProfile } from "@/hooks/useFieldRepProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface InspectionTypesProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const InspectionTypes = ({ form }: InspectionTypesProps) => {
  const { workTypes, loading } = useWorkTypes();
  const inspectionTypes = workTypes.map(wt => wt.name);
  const { saveProfile } = useFieldRepProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInspectionTypes = async () => {
    if (isSaving || !user) return;
    setIsSaving(true);
    try {
      await saveProfile({
        inspection_types: form.watch("inspectionTypes"),
      });
      toast({
        title: "Inspection Types Saved",
        description: "Your inspection types have been saved.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save inspection types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading work types...</div>
    );
  }

  return (
    <div className="space-y-4">
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
                    const currentValue = field.value || [];
                    return (
                      <FormItem
                        key={type}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={currentValue.includes(type)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...currentValue, type])
                                : field.onChange(
                                    currentValue.filter(
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
      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSaveInspectionTypes}
          size="sm"
          variant="outline"
          disabled={isSaving}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};
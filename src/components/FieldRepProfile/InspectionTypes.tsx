import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { useWorkTypes } from "@/hooks/useWorkTypes";
import { Save } from "lucide-react";
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Inspection Types</h3>
        <div className="text-sm text-muted-foreground">Loading work types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Inspection Types</h3>
        <Button
          onClick={handleSaveInspectionTypes}
          size="sm"
          variant="outline"
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
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
    </div>
  );
};
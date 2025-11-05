import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { VendorFormData } from "./types";
import { useWorkTypes } from "@/hooks/useWorkTypes";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useToast } from "@/hooks/use-toast";

interface VendorWorkTypesProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorWorkTypes = ({ form }: VendorWorkTypesProps) => {
  const { workTypes, loading } = useWorkTypes();
  const { saveProfile } = useVendorProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    const currentWorkTypes = form.getValues("workTypes");
    if (checked) {
      form.setValue("workTypes", [...currentWorkTypes, workType]);
    } else {
      form.setValue("workTypes", currentWorkTypes.filter(type => type !== workType));
    }
  };

  const handleSaveWorkTypes = async () => {
    if (isSaving) return;
    
    const workTypes = form.getValues("workTypes");
    
    if (workTypes.length === 0) {
      toast({
        title: "No Work Types Selected",
        description: "Please select at least one work type.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({
        work_types: workTypes,
      });
      
      toast({
        title: "Work Types Saved",
        description: "Your work type preferences have been saved successfully!",
      });
    } catch (error: any) {
      console.error('Save work types error:', error);
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save work types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <FormItem>
        <FormLabel className="text-base font-semibold">Types of Work We Assign *</FormLabel>
        <div className="text-sm text-muted-foreground">Loading work types...</div>
      </FormItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name="workTypes"
      render={() => (
        <FormItem>
          <div className="flex items-center justify-between mb-4">
            <FormLabel className="text-base font-semibold">Types of Work We Assign *</FormLabel>
            <Button
              type="button"
              onClick={handleSaveWorkTypes}
              disabled={isSaving}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {workTypes.map((workType) => (
              <div key={workType.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={workType.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                  onCheckedChange={(checked) => handleWorkTypeChange(workType.name, checked as boolean)}
                />
                <Label htmlFor={workType.name.toLowerCase().replace(/[^a-z0-9]/g, "-")} className="text-sm">
                  {workType.name}
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
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";

interface DisplayIdentityProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const DisplayIdentity = ({ form }: DisplayIdentityProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Display Identity</h3>
        <div className="text-xs bg-accent px-2 py-1 rounded">Public</div>
      </div>
      
      <FormField
        control={form.control}
        name="displayUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Username</FormLabel>
            <FormControl>
              <Input placeholder="ProInspector123" {...field} />
            </FormControl>
            <FormDescription className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">
                Since this is a fresh platform, you can establish yourself under an alias until you become a "Trusted Field Rep". 
                This allows you to build your reputation without preconceived notions.
              </span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
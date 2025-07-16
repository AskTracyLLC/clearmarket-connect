import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
            <div className="flex items-center gap-2">
              <FormLabel>Display Username</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Since this is a fresh platform, you can establish yourself under an alias until you become a "Trusted Field Rep". 
                      This allows you to build your reputation without preconceived notions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input placeholder="ProInspector123" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PersonalInfoProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const PersonalInfo = ({ form }: PersonalInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="text-xs bg-muted px-2 py-1 rounded">Private</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                      <button type="button" className="p-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/90">
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        During the beta phase, display names are locked to prevent confusion. 
                        Username customization will be available after the beta period ends.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input 
                  {...field} 
                  disabled 
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                  placeholder="Locked during beta"
                />
              </FormControl>
              <div className="text-xs text-muted-foreground">
                🔒 Username editing locked during beta - Renaming will be available post-beta
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
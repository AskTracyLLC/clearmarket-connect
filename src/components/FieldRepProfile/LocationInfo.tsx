import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { useStates, useLocationByZip } from "@/hooks/useLocationData";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface LocationInfoProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const LocationInfo = ({ form }: LocationInfoProps) => {
  const { states } = useStates();
  const [zipCode, setZipCode] = useState("");
  const { location } = useLocationByZip(zipCode);

  // Auto-populate city and state when zip code is entered
  useEffect(() => {
    if (location && location.county && location.state) {
      // Use the zip's location to suggest city/state but don't override user input
      if (!form.getValues("state")) {
        form.setValue("state", location.state.code);
      }
    }
  }, [location, form]);

  const handleZipChange = (value: string) => {
    setZipCode(value);
    form.setValue("zipCode", value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Location Information</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Your location helps vendors calculate accurate distances and find coverage in your area.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Chicago" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-96 overflow-y-auto bg-background border-border">
                  {states.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="60601" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleZipChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter your ZIP code for accurate distance calculations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {location && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Detected location:</span> {location.county?.name} County, {location.state?.name}
          </p>
        </div>
      )}
    </div>
  );
};
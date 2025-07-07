import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VendorFormData } from "./types";
import { formatPhoneNumber } from "./utils";

interface VendorBasicInfoProps {
  form: UseFormReturn<VendorFormData>;
}

export const VendorBasicInfo = ({ form }: VendorBasicInfoProps) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue("phone", formatted);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input placeholder="ABC Property Services LLC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyAbbreviation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Abbreviation *</FormLabel>
              <FormControl>
                <Input placeholder="ABCPS" maxLength={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(555) 123-4567" 
                  {...field}
                  onChange={handlePhoneChange}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@abcpropertyservices.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input placeholder="https://www.abcpropertyservices.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
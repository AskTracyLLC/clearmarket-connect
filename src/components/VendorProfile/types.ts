import * as z from "zod";

export const vendorFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyAbbreviation: z.string().min(2, "Abbreviation must be at least 2 characters").max(10, "Abbreviation must be 10 characters or less"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone must be in format (555) 123-4567"),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().optional(),
  workTypes: z.array(z.string()).min(1, "Please select at least one work type"),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  otherPlatform: z.string().optional(),
  companyBio: z.string(),
  avgJobs: z.string().min(1, "Please select average jobs per month"),
  paymentTerms: z.string().min(1, "Please select payment terms"),
});

export type VendorFormData = z.infer<typeof vendorFormSchema>;

export type CoverageArea = {
  id: string;
  state: string;
  stateCode: string;
  counties: string[];
  isAllCounties: boolean;
};
import * as z from "zod";

// Validation schema
export const fieldRepSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  displayUsername: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  aspenGroveId: z.string().optional(),
  aspenGroveExpiration: z.date().optional(),
  platforms: z.array(z.string()),
  inspectionTypes: z.array(z.string()),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  clearVueBeta: z.boolean().default(false),
});

export type FieldRepFormData = z.infer<typeof fieldRepSchema>;

export interface CoverageArea {
  id: string;
  state: string;
  stateCode: string;
  counties: string[];
  standardPrice: string;
  rushPrice: string;
}
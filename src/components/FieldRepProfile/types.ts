import * as z from "zod";

// Validation schema
export const fieldRepSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  displayUsername: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number").optional().or(z.literal('')),
  email: z.string().email("Please enter a valid email address"),
  // Location fields
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "Please select a state"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  hasAspenGrove: z.boolean().default(false),
  aspenGroveId: z.string().optional(),
  aspenGroveExpiration: z.date().optional(),
  aspenGroveImage: z.string().optional(), // URL to uploaded image
  hasHudKeys: z.boolean().default(false),
  hudKeys: z.array(z.string()).optional(),
  otherHudKey: z.string().optional(),
  platforms: z.array(z.string()),
  otherPlatform: z.string().optional(),
  inspectionTypes: z.array(z.string()),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  interestedInBeta: z.boolean().default(false),
});

export type FieldRepFormData = z.infer<typeof fieldRepSchema>;

export interface InspectionTypePricing {
  id: string;
  inspectionType: string;
  price: string;
}

export interface CoverageArea {
  id: string;
  state: string;
  stateCode: string;
  counties: string[];
  standardPrice: string;
  rushPrice: string;
  inspectionTypes: InspectionTypePricing[];
}

export interface FieldRepProfile {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bio?: string;
  hasAspenGrove?: boolean;
  aspen_grove_id?: string;
  aspen_grove_expiration?: Date;
  aspen_grove_image?: string;
  platforms?: string[];
  other_platform?: string;
  inspection_types?: string[];
  hasHudKeys?: boolean;
  hud_keys?: string[];
  other_hud_key?: string;
  interested_in_beta?: boolean;
  profile_complete_percentage?: number;
  created_at?: string;
  updated_at?: string;
}
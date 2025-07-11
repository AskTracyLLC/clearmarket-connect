-- Update the vendor_signups table to support multiple primary services as an array
ALTER TABLE public.vendor_signups 
ALTER COLUMN primary_service TYPE text[] USING string_to_array(primary_service, ',');
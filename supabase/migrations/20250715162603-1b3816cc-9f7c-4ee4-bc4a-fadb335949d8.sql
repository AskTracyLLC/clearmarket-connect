-- Add logging to better track signup email triggers
ALTER TABLE public.field_rep_signups ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.vendor_signups ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
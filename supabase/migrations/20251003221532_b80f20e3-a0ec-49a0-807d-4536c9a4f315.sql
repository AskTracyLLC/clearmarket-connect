-- Add first_name and last_name columns to nda_signatures table
-- This will allow us to store and retrieve full names for NDA documents and auto-fill profile setup

ALTER TABLE public.nda_signatures 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;
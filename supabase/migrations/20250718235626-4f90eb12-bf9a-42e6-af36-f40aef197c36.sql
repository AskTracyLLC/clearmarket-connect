-- Clean up redundant columns from pre_launch_signups table
-- First, let's see what we have and clean it up properly

-- Drop the redundant columns that exist
ALTER TABLE public.pre_launch_signups 
DROP COLUMN IF EXISTS states_covered,
DROP COLUMN IF EXISTS work_types,
DROP COLUMN IF EXISTS most_interested_features;

-- Rename type_of_work to work_type if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_launch_signups' AND column_name = 'type_of_work') THEN
    ALTER TABLE public.pre_launch_signups RENAME COLUMN type_of_work TO work_type;
  END IF;
END $$;

-- Ensure the correct columns exist
ALTER TABLE public.pre_launch_signups 
ADD COLUMN IF NOT EXISTS work_type TEXT[],
ADD COLUMN IF NOT EXISTS interested_features TEXT[];
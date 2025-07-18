-- Clean up redundant columns from pre_launch_signups table
-- Keep only: primary_state, work_type, interested_features

-- Drop the redundant columns that are not the correct ones
ALTER TABLE public.pre_launch_signups 
DROP COLUMN IF EXISTS states_covered,
DROP COLUMN IF EXISTS work_types,
DROP COLUMN IF EXISTS current_challenges,
DROP COLUMN IF EXISTS most_interested_features;

-- Rename type_of_work to work_type if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_launch_signups' AND column_name = 'type_of_work') THEN
    ALTER TABLE public.pre_launch_signups RENAME COLUMN type_of_work TO work_type;
  END IF;
END $$;

-- Ensure correct columns exist with proper types
ALTER TABLE public.pre_launch_signups 
ADD COLUMN IF NOT EXISTS work_type TEXT[],
ADD COLUMN IF NOT EXISTS interested_features TEXT[];

-- Update current_challenges to be TEXT instead of array if needed
ALTER TABLE public.pre_launch_signups 
ALTER COLUMN current_challenges TYPE TEXT;
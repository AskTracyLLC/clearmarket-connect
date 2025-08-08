-- Migration: Allow public read access to active work types for Prelaunch page
-- Rollback instructions are included as comments

-- 1) Enable RLS on work_types (safe if already enabled)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='work_types'
  ) THEN
    EXECUTE 'ALTER TABLE public.work_types ENABLE ROW LEVEL SECURITY';
  ELSE
    RAISE NOTICE 'Table public.work_types does not exist, skipping RLS enable.';
  END IF;
END $$;
-- Rollback: ALTER TABLE public.work_types DISABLE ROW LEVEL SECURITY; -- only if desired

-- 2) Public SELECT policy for active rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='work_types'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view active work_types" ON public.work_types;
    CREATE POLICY "Anyone can view active work_types"
    ON public.work_types
    FOR SELECT
    USING (is_active = true);
  ELSE
    RAISE NOTICE 'Table public.work_types does not exist, skipping policy creation.';
  END IF;
END $$;
-- Rollback: DROP POLICY IF EXISTS "Anyone can view active work_types" ON public.work_types;
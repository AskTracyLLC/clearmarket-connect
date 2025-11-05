-- Add created_by column to vendor_organizations
ALTER TABLE public.vendor_organizations 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Backfill created_by from existing admin staff members
-- Each vendor org should have at least one admin
UPDATE public.vendor_organizations vo
SET created_by = (
  SELECT vsm.user_id 
  FROM public.vendor_staff_members vsm
  WHERE vsm.vendor_org_id = vo.id 
  AND vsm.role = 'admin' 
  AND vsm.is_active = true
  ORDER BY vsm.created_at ASC
  LIMIT 1
)
WHERE created_by IS NULL;

-- Update the trigger function to use the new created_by column
CREATE OR REPLACE FUNCTION public.add_vendor_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the vendor creator as an admin in vendor_staff_members
  -- Only if created_by is set
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.vendor_staff_members (
      user_id,
      vendor_org_id,
      role,
      is_active
    )
    VALUES (
      NEW.created_by,
      NEW.id,
      'admin',
      true
    )
    ON CONFLICT (user_id, vendor_org_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON COLUMN public.vendor_organizations.created_by IS 'User ID of the vendor organization creator, automatically added as admin';
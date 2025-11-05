-- Create trigger function to automatically add vendor creator as admin
CREATE OR REPLACE FUNCTION public.add_vendor_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the vendor creator as an admin in vendor_staff_members
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
  
  RETURN NEW;
END;
$$;

-- Create trigger on vendor_organizations
DROP TRIGGER IF EXISTS on_vendor_organization_created ON public.vendor_organizations;

CREATE TRIGGER on_vendor_organization_created
  AFTER INSERT ON public.vendor_organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.add_vendor_creator_as_admin();

COMMENT ON FUNCTION public.add_vendor_creator_as_admin() IS 'Automatically adds the vendor organization creator as an admin staff member';
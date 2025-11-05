-- Create function to transfer primary admin of vendor organization
CREATE OR REPLACE FUNCTION public.transfer_vendor_primary_admin(
  target_vendor_org_id UUID,
  new_admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_primary_admin UUID;
  is_caller_system_admin BOOLEAN;
  new_admin_is_staff BOOLEAN;
BEGIN
  -- Get current primary admin
  SELECT created_by INTO current_primary_admin
  FROM public.vendor_organizations
  WHERE id = target_vendor_org_id;
  
  IF current_primary_admin IS NULL THEN
    RAISE EXCEPTION 'Vendor organization not found';
  END IF;
  
  -- Check if caller is system admin
  is_caller_system_admin := (get_user_role(auth.uid()) = 'admin'::user_role);
  
  -- Verify caller is either current primary admin or system admin
  IF NOT (auth.uid() = current_primary_admin OR is_caller_system_admin) THEN
    RAISE EXCEPTION 'Only the current primary admin or system admin can transfer ownership';
  END IF;
  
  -- Verify new admin is an active admin staff member
  SELECT EXISTS (
    SELECT 1 
    FROM public.vendor_staff_members
    WHERE user_id = new_admin_user_id
      AND vendor_org_id = target_vendor_org_id
      AND role = 'admin'
      AND is_active = true
  ) INTO new_admin_is_staff;
  
  IF NOT new_admin_is_staff THEN
    RAISE EXCEPTION 'New admin must be an active admin staff member of the organization';
  END IF;
  
  -- Update the primary admin
  UPDATE public.vendor_organizations
  SET created_by = new_admin_user_id
  WHERE id = target_vendor_org_id;
  
  -- Log the transfer
  INSERT INTO public.audit_log (
    user_id,
    action,
    target_table,
    target_id,
    metadata,
    performed_by_admin
  ) VALUES (
    auth.uid(),
    'vendor_admin_transfer',
    'vendor_organizations',
    target_vendor_org_id,
    jsonb_build_object(
      'previous_admin', current_primary_admin,
      'new_admin', new_admin_user_id,
      'transferred_by', auth.uid()
    ),
    is_caller_system_admin
  );
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.transfer_vendor_primary_admin IS 'Transfers primary admin ownership of a vendor organization to another admin staff member';
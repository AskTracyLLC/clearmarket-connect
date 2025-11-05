-- First, update any existing 'manager' roles to 'admin' to prepare for role restriction
UPDATE vendor_staff_members 
SET role = 'admin' 
WHERE role = 'manager';

-- Add check constraint to limit roles to 'admin' and 'staff'
ALTER TABLE vendor_staff_members 
DROP CONSTRAINT IF EXISTS vendor_staff_members_role_check;

ALTER TABLE vendor_staff_members 
ADD CONSTRAINT vendor_staff_members_role_check 
CHECK (role IN ('admin', 'staff'));

-- Enable RLS on vendor_staff_members
ALTER TABLE vendor_staff_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view their org members" ON vendor_staff_members;
DROP POLICY IF EXISTS "Admins can add staff members" ON vendor_staff_members;
DROP POLICY IF EXISTS "Admins can update staff members" ON vendor_staff_members;

-- Policy: Staff members can view their own organization's staff
CREATE POLICY "Staff can view their org members"
ON vendor_staff_members
FOR SELECT
TO authenticated
USING (
  vendor_org_id IN (
    SELECT vendor_org_id 
    FROM vendor_staff_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Only admins can add new staff members
CREATE POLICY "Admins can add staff members"
ON vendor_staff_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM vendor_staff_members vsm
    WHERE vsm.user_id = auth.uid() 
      AND vsm.vendor_org_id = vendor_staff_members.vendor_org_id
      AND vsm.role = 'admin'
      AND vsm.is_active = true
  )
);

-- Policy: Only admins can update staff members
CREATE POLICY "Admins can update staff members"
ON vendor_staff_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM vendor_staff_members vsm
    WHERE vsm.user_id = auth.uid() 
      AND vsm.vendor_org_id = vendor_staff_members.vendor_org_id
      AND vsm.role = 'admin'
      AND vsm.is_active = true
  )
);

-- Create helper function to check if user is vendor admin
CREATE OR REPLACE FUNCTION is_vendor_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM vendor_staff_members
    WHERE user_id = check_user_id
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Create helper function to check if user is vendor staff (any role)
CREATE OR REPLACE FUNCTION is_vendor_staff(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM vendor_staff_members
    WHERE user_id = check_user_id
      AND is_active = true
  );
$$;

-- Enable RLS on vendor_organizations
ALTER TABLE vendor_organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view their organization" ON vendor_organizations;
DROP POLICY IF EXISTS "Only admins can update organization" ON vendor_organizations;

-- Policy: All staff can view their organization
CREATE POLICY "Staff can view their organization"
ON vendor_organizations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT vendor_org_id 
    FROM vendor_staff_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Only admins can update organization
CREATE POLICY "Only admins can update organization"
ON vendor_organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM vendor_staff_members 
    WHERE user_id = auth.uid() 
      AND vendor_org_id = vendor_organizations.id
      AND role = 'admin'
      AND is_active = true
  )
);
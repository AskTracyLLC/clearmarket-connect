-- Fix infinite recursion in RLS policies for vendor_staff_members by introducing SECURITY DEFINER helper functions
-- Rollback notes: see comments at the end for reverting policy changes

-- 1) Helper functions (SECURITY DEFINER) to avoid recursive RLS evaluation
create or replace function public.is_vendor_member(_user_id uuid, _vendor_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vendor_staff_members vsm
    where vsm.vendor_org_id = _vendor_org_id
      and vsm.user_id = _user_id
      and vsm.is_active = true
  );
$$;

create or replace function public.is_vendor_admin(_user_id uuid, _vendor_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vendor_staff_members vsm
    where vsm.vendor_org_id = _vendor_org_id
      and vsm.user_id = _user_id
      and vsm.role = 'admin'
      and vsm.is_active = true
  );
$$;

-- 2) Ensure RLS is enabled (no-op if already enabled)
alter table if exists public.vendor_staff_members enable row level security;

-- 3) Replace recursive policies with function-based ones
-- Drop old recursive policies if they exist
DROP POLICY IF EXISTS "Vendor admins can manage their organization's staff" ON public.vendor_staff_members;
DROP POLICY IF EXISTS "Vendor staff can view their organization's staff" ON public.vendor_staff_members;

-- Recreate using the new helper functions
CREATE POLICY "Vendor admins can manage their organization's staff"
ON public.vendor_staff_members
FOR ALL
TO authenticated
USING (public.is_vendor_admin(auth.uid(), vendor_staff_members.vendor_org_id))
WITH CHECK (public.is_vendor_admin(auth.uid(), vendor_staff_members.vendor_org_id));

CREATE POLICY "Vendor staff can view their organization's staff"
ON public.vendor_staff_members
FOR SELECT
TO authenticated
USING (public.is_vendor_member(auth.uid(), vendor_staff_members.vendor_org_id));

-- Note: Keeping existing admin-wide policy: "Admins can manage all vendor staff"
-- If missing in some environments, uncomment below to (re)create using get_user_role
-- CREATE POLICY "Admins can manage all vendor staff"
-- ON public.vendor_staff_members
-- FOR ALL
-- TO authenticated
-- USING (get_user_role(auth.uid()) = 'admin')
-- WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Rollback instructions:
-- 1) DROP POLICY ... (the two new policies) and recreate the previous ones if needed
-- 2) Optionally DROP FUNCTION public.is_vendor_member, public.is_vendor_admin if no longer used
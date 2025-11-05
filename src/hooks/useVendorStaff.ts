import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorStaffMember {
  id: string;
  user_id: string;
  vendor_org_id: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  created_at: string;
  users: {
    id: string;
    display_name: string | null;
    email?: string;
    anonymous_username: string;
  };
}

export interface VendorOrganization {
  id: string;
  company_name: string;
  created_at: string;
  created_by?: string;
}

export const useVendorStaff = () => {
  const [staff, setStaff] = useState<VendorStaffMember[]>([]);
  const [vendorOrg, setVendorOrg] = useState<VendorOrganization | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [primaryAdminId, setPrimaryAdminId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVendorOrg = async () => {
    if (!user) return;

    try {
      // First, check if user is part of any vendor organization
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff_members')
        .select(`
          vendor_org_id,
          role,
          vendor_organizations (
            id,
            company_name,
            created_at,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (staffError) {
        console.error('Error fetching vendor org:', staffError);
        return;
      }

      if (staffData) {
        const org = staffData.vendor_organizations as VendorOrganization;
        setVendorOrg(org);
        setCurrentUserRole(staffData.role);
        setPrimaryAdminId(org.created_by || null);
      }
    } catch (error) {
      console.error('Error in fetchVendorOrg:', error);
    }
  };

  const fetchStaff = async () => {
    if (!vendorOrg) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_staff_members')
        .select(`
          id,
          user_id,
          vendor_org_id,
          role,
          is_active,
          created_at,
          users (
            id,
            display_name,
            anonymous_username
          )
        `)
        .eq('vendor_org_id', vendorOrg.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff((data || []) as VendorStaffMember[]);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStaffRole = async (staffId: string, newRole: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can update staff roles",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('vendor_staff_members')
        .update({ role: newRole })
        .eq('id', staffId);

      if (error) throw error;

      await fetchStaff();
      toast({
        title: "Success",
        description: "Staff role updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating staff role:', error);
      toast({
        title: "Error",
        description: "Failed to update staff role",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeStaffMember = async (staffId: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can remove staff members",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('vendor_staff_members')
        .update({ is_active: false })
        .eq('id', staffId);

      if (error) throw error;

      await fetchStaff();
      toast({
        title: "Success",
        description: "Staff member removed successfully",
      });
      return true;
    } catch (error) {
      console.error('Error removing staff member:', error);
      toast({
        title: "Error",
        description: "Failed to remove staff member",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVendorOrg();
  }, [user]);

  useEffect(() => {
    if (vendorOrg) {
      fetchStaff();
    }
  }, [vendorOrg]);

  return {
    staff,
    vendorOrg,
    currentUserRole,
    primaryAdminId,
    loading,
    refetch: fetchStaff,
    updateStaffRole,
    removeStaffMember,
  };
};
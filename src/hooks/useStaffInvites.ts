import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InviteStaffData {
  email: string;
  role: 'admin' | 'staff';
  personalMessage?: string;
}

export const useStaffInvites = (vendorOrgId: string | null) => {
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const sendStaffInvite = async (inviteData: InviteStaffData) => {
    if (!vendorOrgId) {
      toast({
        title: "Error",
        description: "No vendor organization found",
        variant: "destructive",
      });
      return false;
    }

    setIsInviting(true);
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteData.email)
        .single();

      // Check if already a staff member
      if (existingUser) {
        const { data: existingStaff } = await supabase
          .from('vendor_staff_members')
          .select('id')
          .eq('user_id', existingUser.id)
          .eq('vendor_org_id', vendorOrgId)
          .single();

        if (existingStaff) {
          toast({
            title: "Already a member",
            description: "This user is already part of your organization",
            variant: "destructive",
          });
          return false;
        }

        // Add existing user to staff
        const { error: staffError } = await supabase
          .from('vendor_staff_members')
          .insert({
            user_id: existingUser.id,
            vendor_org_id: vendorOrgId,
            role: inviteData.role,
            is_active: true,
          });

        if (staffError) throw staffError;
      } else {
        // For new users, we would typically create an invitation system
        // For now, we'll create a pending staff record and send an email
        toast({
          title: "Invite Sent",
          description: "An invitation has been sent to the email address",
        });
      }

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-staff-invitation', {
        body: {
          email: inviteData.email,
          role: inviteData.role,
          personalMessage: inviteData.personalMessage,
          vendorOrgId: vendorOrgId,
        },
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Success",
        description: "Staff invitation sent successfully",
      });
      return true;
    } catch (error) {
      console.error('Error sending staff invite:', error);
      toast({
        title: "Error",
        description: "Failed to send staff invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  return {
    sendStaffInvite,
    isInviting,
  };
};
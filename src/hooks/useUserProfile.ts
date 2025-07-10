import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type User = Database["public"]["Tables"]["users"]["Row"];

export interface UserAccountData {
  displayName: string;
  email: string;
  joinDate: string;
  lastActive: string;
  role: string;
  trustScore: number;
  profileComplete: number;
}

export const useUserProfile = () => {
  const [accountData, setAccountData] = useState<UserAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user data from public.users table with fallback handling
      let { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no user record exists, create one
      if (!userData) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            display_name: user.user_metadata?.display_name || "New User",
            role: 'field_rep'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }

      setAccountData({
        displayName: userData.display_name || "Anonymous User",
        email: user.email || "",
        joinDate: format(new Date(userData.created_at || ""), "MMMM dd, yyyy"),
        lastActive: userData.last_active 
          ? format(new Date(userData.last_active), "MMM dd 'at' HH:mm") 
          : "Just now",
        role: userData.role || "field_rep",
        trustScore: userData.trust_score || 0,
        profileComplete: userData.profile_complete || 0,
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { displayName?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("users")
        .update({
          display_name: updates.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      if (accountData) {
        setAccountData({
          ...accountData,
          displayName: updates.displayName || accountData.displayName,
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Email Update Sent",
        description: "Please check both your old and new email addresses to confirm the change.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Email Update Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    accountData,
    loading,
    error,
    updateProfile,
    changePassword,
    updateEmail,
    refetch: fetchUserProfile,
  };
};
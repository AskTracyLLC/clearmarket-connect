import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"];

export interface PrivacySettings {
  profileVisibility: string;
  emailNotifications: {
    newMessages: boolean;
    newConnections: boolean;
    feedbackReceived: boolean;
    weeklyDigest: boolean;
    communityActivity: boolean;
  };
  searchVisibility: boolean;
  directInviteOnly: boolean;
}

export interface NotificationSettings {
  emailNotifications: {
    newMessages: boolean;
    newConnections: boolean;
    feedbackReceived: boolean;
    weeklyDigest: boolean;
    communityActivity: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    newMessages: boolean;
    networkUpdates: boolean;
  };
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Try to get existing preferences
      let { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no preferences exist, create default ones
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newPrefs;
      }

      setPreferences(data);
    } catch (error: any) {
      toast({
        title: "Error loading preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferencesUpdate>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !preferences) return false;

      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePrivacySettings = async (settings: PrivacySettings) => {
    const success = await updatePreferences({
      profile_visibility: settings.profileVisibility,
      search_visibility: settings.searchVisibility,
      direct_invite_only: settings.directInviteOnly,
      email_new_messages: settings.emailNotifications.newMessages,
      email_new_connections: settings.emailNotifications.newConnections,
      email_feedback_received: settings.emailNotifications.feedbackReceived,
      email_weekly_digest: settings.emailNotifications.weeklyDigest,
      email_community_activity: settings.emailNotifications.communityActivity,
    });

    if (success) {
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    }
    return success;
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    const success = await updatePreferences({
      email_new_messages: settings.emailNotifications.newMessages,
      email_new_connections: settings.emailNotifications.newConnections,
      email_feedback_received: settings.emailNotifications.feedbackReceived,
      email_weekly_digest: settings.emailNotifications.weeklyDigest,
      email_community_activity: settings.emailNotifications.communityActivity,
      push_enabled: settings.pushNotifications.enabled,
      push_new_messages: settings.pushNotifications.newMessages,
      push_network_updates: settings.pushNotifications.networkUpdates,
    });

    if (success) {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    }
    return success;
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    updatePrivacySettings,
    updateNotificationSettings,
    refetch: fetchPreferences,
  };
};
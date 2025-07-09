import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { useUserPreferences, type NotificationSettings as NotificationSettingsType } from "@/hooks/useUserPreferences";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsSettingsProps {
  onSave?: (settings: NotificationSettingsType) => void;
}

const NotificationsSettings = ({ onSave }: NotificationsSettingsProps) => {
  const { preferences, loading, updateNotificationSettings } = useUserPreferences();
  const [settings, setSettings] = useState<NotificationSettingsType>({
    emailNotifications: {
      newMessages: true,
      newConnections: true,
      feedbackReceived: true,
      weeklyDigest: false,
      communityActivity: false
    },
    pushNotifications: {
      enabled: false,
      newMessages: false,
      networkUpdates: false
    }
  });

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setSettings({
        emailNotifications: {
          newMessages: preferences.email_new_messages,
          newConnections: preferences.email_new_connections,
          feedbackReceived: preferences.email_feedback_received,
          weeklyDigest: preferences.email_weekly_digest,
          communityActivity: preferences.email_community_activity,
        },
        pushNotifications: {
          enabled: preferences.push_enabled,
          newMessages: preferences.push_new_messages,
          networkUpdates: preferences.push_network_updates,
        },
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    const success = await updateNotificationSettings(settings);
    if (success) {
      onSave?.(settings);
    }
  };

  const updateEmailNotification = (key: keyof typeof settings.emailNotifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: value
      }
    }));
  };

  const updatePushNotification = (key: keyof typeof settings.pushNotifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose which email notifications you want to receive
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>New Messages</Label>
              <p className="text-sm text-muted-foreground">Get notified of new direct messages</p>
            </div>
            <Switch
              checked={settings.emailNotifications.newMessages}
              onCheckedChange={(checked) => updateEmailNotification('newMessages', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>New Connections</Label>
              <p className="text-sm text-muted-foreground">When someone adds you to their network</p>
            </div>
            <Switch
              checked={settings.emailNotifications.newConnections}
              onCheckedChange={(checked) => updateEmailNotification('newConnections', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Feedback Received</Label>
              <p className="text-sm text-muted-foreground">When you receive new feedback or reviews</p>
            </div>
            <Switch
              checked={settings.emailNotifications.feedbackReceived}
              onCheckedChange={(checked) => updateEmailNotification('feedbackReceived', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Community Activity</Label>
              <p className="text-sm text-muted-foreground">Replies and mentions in community posts</p>
            </div>
            <Switch
              checked={settings.emailNotifications.communityActivity}
              onCheckedChange={(checked) => updateEmailNotification('communityActivity', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">Weekly summary of platform activity</p>
            </div>
            <Switch
              checked={settings.emailNotifications.weeklyDigest}
              onCheckedChange={(checked) => updateEmailNotification('weeklyDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">
            Receive instant notifications in your browser
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Allow browser notifications</p>
            </div>
            <Switch
              checked={settings.pushNotifications.enabled}
              onCheckedChange={(checked) => updatePushNotification('enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>New Messages</Label>
              <p className="text-sm text-muted-foreground">Instant alerts for direct messages</p>
            </div>
            <Switch
              checked={settings.pushNotifications.newMessages}
              onCheckedChange={(checked) => updatePushNotification('newMessages', checked)}
              disabled={!settings.pushNotifications.enabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Network Updates</Label>
              <p className="text-sm text-muted-foreground">Calendar events and availability alerts</p>
            </div>
            <Switch
              checked={settings.pushNotifications.networkUpdates}
              onCheckedChange={(checked) => updatePushNotification('networkUpdates', checked)}
              disabled={!settings.pushNotifications.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSettings;
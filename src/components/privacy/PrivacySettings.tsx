import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Eye, HelpCircle, Bell } from "lucide-react";
import { useUserPreferences, type PrivacySettings as PrivacySettingsType } from "@/hooks/useUserPreferences";
import { Skeleton } from "@/components/ui/skeleton";

interface PrivacySettingsProps {
  onSave?: (settings: PrivacySettingsType) => void;
}

const PrivacySettings = ({ onSave }: PrivacySettingsProps) => {
  const { preferences, loading, updatePrivacySettings } = useUserPreferences();
  const [settings, setSettings] = useState<PrivacySettingsType>({
    profileVisibility: "public",
    emailNotifications: {
      newMessages: true,
      newConnections: true,
      feedbackReceived: true,
      weeklyDigest: false,
      communityActivity: false
    },
    searchVisibility: true,
    directInviteOnly: false
  });

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setSettings({
        profileVisibility: preferences.profile_visibility,
        emailNotifications: {
          newMessages: preferences.email_new_messages,
          newConnections: preferences.email_new_connections,
          feedbackReceived: preferences.email_feedback_received,
          weeklyDigest: preferences.email_weekly_digest,
          communityActivity: preferences.email_community_activity,
        },
        searchVisibility: preferences.search_visibility,
        directInviteOnly: preferences.direct_invite_only,
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    const success = await updatePrivacySettings(settings);
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Profile Visibility</Label>
            <Select 
              value={settings.profileVisibility} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can find and view</SelectItem>
                <SelectItem value="network">Network Only - Only my connections can view</SelectItem>
                <SelectItem value="private">Private - Hidden from search</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show in Search Results</Label>
              <p className="text-sm text-muted-foreground">
                Allow your profile to appear in vendor searches
              </p>
            </div>
            <Switch
              checked={settings.searchVisibility}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, searchVisibility: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Label>Private Connection Mode</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>When enabled, your profile will not appear in general searches. You can only be added to a network if someone sends you a direct invitation link or code.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                Hide from public searches, require direct invitations
              </p>
            </div>
            <Switch
              checked={settings.directInviteOnly}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, directInviteOnly: checked }))}
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default PrivacySettings;
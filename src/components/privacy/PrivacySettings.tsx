import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Eye, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettingsProps {
  onSave?: (settings: PrivacySettings) => void;
}

interface PrivacySettings {
  profileVisibility: string;
  contactInfoVisibility: boolean;
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

const PrivacySettings = ({ onSave }: PrivacySettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    contactInfoVisibility: false,
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

  const handleSave = () => {
    onSave?.(settings);
    toast({
      title: "Settings Saved",
      description: "Your privacy settings have been updated successfully.",
    });
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
            <div className="space-y-1">
              <Label>Contact Info Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show contact details before connection unlock
              </p>
            </div>
            <Switch
              checked={settings.contactInfoVisibility}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, contactInfoVisibility: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Direct Invite Only</Label>
              <p className="text-sm text-muted-foreground">
                Only accept connections from direct invitations
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
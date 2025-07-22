
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail,
  Save,
  AlertTriangle,
  Check
} from "lucide-react";

interface AdminSettingsProps {
  profile: any;
}

export const AdminSettings = ({ profile }: AdminSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    systemUpdates: true,
    auditLogRetention: 90,
    sessionTimeout: 8,
    requireTwoFactor: true,
    emailDigest: true,
    maintenanceMode: false
  });

  const handleSave = () => {
    toast({
      title: "Settings Updated",
      description: "Your administrative settings have been saved successfully."
    });
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const updateNumericSetting = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => toggleSetting('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="security-alerts">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Immediate alerts for security events</p>
            </div>
            <Switch
              id="security-alerts"
              checked={settings.securityAlerts}
              onCheckedChange={() => toggleSetting('securityAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-updates">System Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications about platform updates</p>
            </div>
            <Switch
              id="system-updates"
              checked={settings.systemUpdates}
              onCheckedChange={() => toggleSetting('systemUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-digest">Daily Email Digest</Label>
              <p className="text-sm text-muted-foreground">Summary of daily platform activity</p>
            </div>
            <Switch
              id="email-digest"
              checked={settings.emailDigest}
              onCheckedChange={() => toggleSetting('emailDigest')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-2fa">Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enforce 2FA for admin access</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="require-2fa"
                checked={settings.requireTwoFactor}
                onCheckedChange={() => toggleSetting('requireTwoFactor')}
              />
              {settings.requireTwoFactor && (
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
              <Input
                id="session-timeout"
                type="number"
                min="1"
                max="24"
                value={settings.sessionTimeout}
                onChange={(e) => updateNumericSetting('sessionTimeout', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
              <Input
                id="audit-retention"
                type="number"
                min="30"
                max="365"
                value={settings.auditLogRetention}
                onChange={(e) => updateNumericSetting('auditLogRetention', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Enable platform maintenance mode</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onCheckedChange={() => toggleSetting('maintenanceMode')}
              />
              {settings.maintenanceMode && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Maintenance Mode Warning</span>
            </div>
            <p className="text-sm text-yellow-700">
              Enabling maintenance mode will prevent all users (except admins) from accessing the platform.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Key, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccountData {
  displayName: string;
  email: string;
  joinDate: string;
  lastActive: string;
}

interface AccountSettingsProps {
  onSave?: (data: AccountData) => void;
}

const AccountSettings = ({ onSave }: AccountSettingsProps) => {
  const { toast } = useToast();
  const [accountData, setAccountData] = useState<AccountData>({
    displayName: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 15, 2024",
    lastActive: "5 minutes ago"
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    onSave?.(accountData);
    toast({
      title: "Account Updated",
      description: "Your account information has been saved successfully.",
    });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "Account deletion functionality coming soon. Please contact support for assistance.",
      variant: "destructive"
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={accountData.displayName}
              onChange={(e) => setAccountData(prev => ({ ...prev, displayName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={accountData.email}
              onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Used for login and important notifications
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Member Since</Label>
              <p>{accountData.joinDate}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Active</Label>
              <p>{accountData.lastActive}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting your account is permanent and cannot be undone. All your data, connections, and history will be lost.
            </AlertDescription>
          </Alert>

          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            className="w-full"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AccountSettings;
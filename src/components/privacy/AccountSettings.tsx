import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Key, Trash2, AlertTriangle, Shield, Star } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccountSettingsProps {
  onSave?: (data: any) => void;
}

const AccountSettings = ({ onSave }: AccountSettingsProps) => {
  const { profile, loading, updateProfile } = useUserProfile();
  const [accountData, setAccountData] = useState<any>(null);
  const { toast } = useToast();
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update local state when user data is loaded
  useEffect(() => {
    if (profile) {
      setAccountData(profile);
    }
  }, [profile]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handleSave = async () => {
    if (!accountData) return;
    
    const success = await updateProfile({
      display_name: accountData.displayName,
    });
    
    if (success) {
      onSave?.(accountData);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === accountData?.email) return;
    
    // Email update functionality would go here
    const success = false; // Placeholder
    if (success) {
      setNewEmail("");
    }
  };

  const handleDeleteAccount = async () => {
    // For now, just show a warning - actual deletion would need admin approval
    return;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading || !accountData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
              onChange={(e) => setAccountData(prev => prev ? { ...prev, displayName: e.target.value } : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentEmail">Current Email Address</Label>
            <Input
              id="currentEmail"
              type="email"
              value={accountData.email}
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Your current email address used for login
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

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {accountData.role === 'admin' && <Shield className="h-3 w-3" />}
                  {accountData.role === 'moderator' && <Star className="h-3 w-3" />}
                  {accountData.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Trust Score</Label>
              <p>{accountData.trustScore}/100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your email address for login and notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
            />
            <p className="text-sm text-muted-foreground">
              You'll need to confirm the change via email
            </p>
          </div>

          <Button 
            onClick={handleEmailChange} 
            disabled={!newEmail || newEmail === accountData?.email}
          >
            Update Email
          </Button>
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
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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

          {newPassword && newPassword.length < 6 && (
            <p className="text-sm text-destructive">Password must be at least 6 characters</p>
          )}
          
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-destructive">Passwords do not match</p>
          )}

          <Button 
            onClick={handlePasswordChange} 
            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 || passwordLoading}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            No email verification needed - changes take effect immediately.
          </p>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign out of your account on this device.
          </p>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full"
          >
            Sign Out
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
              Account deletion requires admin approval. Contact support for assistance with permanently deleting your account.
            </AlertDescription>
          </Alert>

          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            className="w-full"
            disabled
          >
            Contact Support for Account Deletion
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
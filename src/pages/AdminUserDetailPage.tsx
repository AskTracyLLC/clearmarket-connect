import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Key, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Activity,
  RefreshCw
} from "lucide-react";
import { UserActivityLog } from "@/components/admin/UserActivityLog";
import { ConnectionLimitManager } from "@/components/admin/UserManagement/ConnectionLimitManager";
import Header from "@/components/Header";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  join_date: string;
  is_active: boolean;
  role: string;
  trust_score: number;
  community_score: number;
  display_name: string;
  last_active: string | null;
}

const AdminUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState<string>("");
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const [showLimitManager, setShowLimitManager] = useState(false);
  const [resetLinkUser, setResetLinkUser] = useState<UserProfile | null>(null);

  const fetchUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, trust_score, community_score, display_name, anonymous_username, last_active')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, phone, join_date, is_active')
        .eq('user_id', userId)
        .single();

      const combinedData: UserProfile = {
        id: userData.id,
        user_id: userData.id,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        username: userData.anonymous_username || userData.display_name || 'Unknown',
        email: userData.email || 'No email',
        phone: profileData?.phone || '',
        join_date: profileData?.join_date || new Date().toISOString(),
        is_active: profileData?.is_active ?? true,
        role: userData.role,
        trust_score: userData.trust_score || 0,
        community_score: userData.community_score || 0,
        display_name: userData.display_name || userData.anonymous_username || 'Unknown',
        last_active: userData.last_active || null
      };

      setUser(combinedData);
      setPendingRole(combinedData.role);
      setPendingStatus(null);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      // Handle role change
      if (pendingRole && pendingRole !== user.role) {
        const validRoles = ['admin', 'moderator', 'vendor', 'field_rep'];
        if (!validRoles.includes(pendingRole)) {
          throw new Error(`Invalid role: ${pendingRole}`);
        }

        if (pendingRole === 'admin') {
          toast({
            title: "Warning",
            description: "Admin role assignment requires special permissions",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.rpc('admin_update_user_role', {
          target_user_id: user.user_id,
          new_role: pendingRole as any
        });

        if (error) throw error;

        await supabase.from('audit_log').insert({
          user_id: user.user_id,
          action: 'role_change',
          target_table: 'users',
          target_id: user.user_id,
          metadata: {
            new_role: pendingRole,
            old_role: user.role,
            changed_by: 'admin'
          }
        });
      }

      // Handle status change
      if (pendingStatus !== null && pendingStatus !== user.is_active) {
        const { error } = await supabase.rpc('toggle_user_activation', {
          target_user_id: user.user_id,
          is_active_param: pendingStatus
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });

      fetchUser(); // Refresh data
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleImpersonate = () => {
    if (user) {
      toast({
        title: "Impersonation Started",
        description: `You are now impersonating ${user.display_name}`,
      });
    }
  };

  const generatePasswordResetLink = async () => {
    if (!user) return;

    try {
      setResetLinkUser(user);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) throw resetError;

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      await supabase.from('audit_log').insert({
        user_id: currentUser?.id || null,
        action: 'admin_password_reset_sent',
        target_table: 'users',
        target_id: user.user_id,
        metadata: {
          target_email: user.email,
          target_username: user.username,
          target_display_name: user.display_name,
        },
        performed_by_admin: true,
      });

      toast({
        title: "Password Reset Email Sent",
        description: `A password reset email has been sent to ${user.email}`,
      });

      setTimeout(() => {
        setResetLinkUser(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "destructive",
      moderator: "secondary",
      vendor: "default",
      field_rep: "outline"
    };
    return <Badge variant={variants[role] || "outline"}>{role.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Deactivated'}
      </Badge>
    );
  };

  const currentStatus = pendingStatus !== null ? pendingStatus : user?.is_active ?? true;
  const hasChanges = (pendingRole && pendingRole !== user?.role) || (pendingStatus !== null && pendingStatus !== user?.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          {hasChanges && (
            <Button onClick={handleSaveChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg font-semibold">{user.first_name} {user.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-lg">@{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </label>
                  <p className="text-lg">{user.phone || '-'}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Join Date
                  </label>
                  <p className="text-lg">{format(new Date(user.join_date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Last Active
                  </label>
                  <p className="text-lg">
                    {user.last_active ? format(new Date(user.last_active), 'MMM dd, yyyy HH:mm') : 'Never'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trust Score
                  </label>
                  <p className="text-lg font-semibold">{user.trust_score}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Pulse Score
                  </label>
                  <p className="text-lg font-semibold">{user.community_score}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Management */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Role</label>
                <div className="mb-2">{getRoleBadge(user.role)}</div>
                <label className="text-sm font-medium">Change Role</label>
                <Select value={pendingRole} onValueChange={setPendingRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_rep">Field Rep</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Management */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Status</label>
                <div className="mb-2">{getStatusBadge(currentStatus)}</div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentStatus}
                    onCheckedChange={(checked) => setPendingStatus(checked)}
                  />
                  <label className="text-sm">{currentStatus ? 'Active' : 'Deactivated'}</label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Quick Actions</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowLimitManager(true)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Connection Limits
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generatePasswordResetLink}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Send Password Reset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImpersonate}
                    title="Impersonate User"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <UserActivityLog targetUserId={userId} showUserFilter={false} />

        {/* Connection Limit Manager Modal */}
        <Dialog open={showLimitManager} onOpenChange={setShowLimitManager}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Connection Request Limits</DialogTitle>
            </DialogHeader>
            <ConnectionLimitManager
              userId={user.user_id}
              displayName={user.display_name}
            />
          </DialogContent>
        </Dialog>

        {/* Password Reset Modal */}
        <Dialog open={!!resetLinkUser} onOpenChange={(open) => !open && setResetLinkUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Password Reset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  User: <span className="font-medium text-foreground">{resetLinkUser?.display_name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: <span className="font-medium text-foreground">{resetLinkUser?.email}</span>
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-4 text-sm text-center">
                A password reset email will be sent to the user's email address.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;

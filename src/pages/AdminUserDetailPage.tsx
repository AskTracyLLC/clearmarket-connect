import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  AlertTriangle,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast as sonnerToast } from "sonner";
import { UserActivityLog } from "@/components/admin/UserActivityLog";
import { ConnectionLimitManager } from "@/components/admin/UserManagement/ConnectionLimitManager";
import { useImpersonation } from "@/hooks/useImpersonation";
import Header from "@/components/Header";
import { Textarea } from "@/components/ui/textarea";

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
  const [showLimitManager, setShowLimitManager] = useState(false);
  const [resetLinkUser, setResetLinkUser] = useState<UserProfile | null>(null);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [impersonationReason, setImpersonationReason] = useState("");
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  
  const { startImpersonation } = useImpersonation();

  // Get current user email for Admin#1 check
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', currentUser.id)
          .single();
        
        if (userData?.email) {
          setCurrentUserEmail(userData.email);
        }
      }
    };
    getCurrentUser();
  }, []);

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
      setPendingRole(!combinedData.is_active ? 'inactive' : combinedData.role);
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

  const handleRoleChange = (value: string) => {
    if (value === 'DELETE') {
      setDeleteDialogOpen(true);
      return;
    }
    setPendingRole(value);
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      // Handle inactive status change
      if (pendingRole === 'inactive') {
        const { error } = await supabase.rpc('toggle_user_activation', {
          target_user_id: user.user_id,
          is_active_param: false
        });

        if (error) throw error;

        await supabase.from('audit_log').insert({
          user_id: user.user_id,
          action: 'status_change',
          target_table: 'user_profiles',
          target_id: user.user_id,
          metadata: {
            new_status: 'inactive',
            changed_by: 'admin'
          }
        });
      } 
      // Handle role change
      else if (pendingRole && pendingRole !== user.role) {
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

        // Set user to active when assigning a role
        await supabase.rpc('toggle_user_activation', {
          target_user_id: user.user_id,
          is_active_param: true
        });

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

  const handleDeleteUser = async () => {
    if (deleteConfirmText !== "DELETE") {
      sonnerToast.error("Please type DELETE to confirm");
      return;
    }

    if (!user?.email) {
      sonnerToast.error("User email not found");
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('admin_delete_user_completely', {
        target_user_id: userId
      });

      if (error) throw error;

      // Check if the function returned an error in the response
      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as any;
        if (result.success === false) {
          const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to delete user';
          throw new Error(errorMsg);
        }
        
        if (result.success === true) {
          sonnerToast.success(`User ${user.email} and all data deleted successfully`);
          
          // Log the action
          await supabase.from('audit_log').insert({
            user_id: null,
            action: 'admin_delete_user_completely',
            target_table: 'users',
            target_id: userId,
            metadata: {
              deleted_user_email: user.email,
              deleted_by: currentUserEmail
            },
            performed_by_admin: true
          });
          
          // Navigate back to user directory
          navigate('/admin/users');
        }
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      sonnerToast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
    }
  };

  const handleImpersonate = async () => {
    if (!impersonationReason.trim()) {
      sonnerToast.error("Please provide a reason for impersonation");
      return;
    }

    setIsImpersonating(true);
    try {
      const result = await startImpersonation(userId || '', impersonationReason);
      
      if (result.success) {
        // Log the impersonation
        await supabase.from('audit_log').insert({
          user_id: user?.id,
          action: 'admin_impersonation_start',
          target_table: 'users',
          target_id: userId,
          metadata: {
            reason: impersonationReason,
            session_id: result.sessionId
          },
          performed_by_admin: true
        });

        sonnerToast.success("Impersonation started successfully");
        
        // Redirect based on role
        if (user?.role === 'field_rep') {
          navigate('/fieldrep/profile');
        } else if (user?.role === 'vendor') {
          navigate('/vendor/profile');
        } else {
          navigate('/');
        }
      } else {
        sonnerToast.error(result.error || "Failed to start impersonation");
      }
    } catch (error: any) {
      console.error('Impersonation error:', error);
      sonnerToast.error(error.message || "Failed to start impersonation");
    } finally {
      setIsImpersonating(false);
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

  const currentStatus = user?.is_active ?? true;
  const hasChanges = pendingRole && (
    // If selecting inactive and user is currently active
    (pendingRole === 'inactive' && user?.is_active) ||
    // If selecting a role and user is currently inactive
    (pendingRole !== 'inactive' && !user?.is_active) ||
    // If selecting a different role than current
    (pendingRole !== 'inactive' && pendingRole !== user?.role)
  );

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
                <div className="mb-2 flex gap-2">
                  {getRoleBadge(user.role)}
                  {!user.is_active && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <label className="text-sm font-medium">Change Role</label>
                <Select value={pendingRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="field_rep">Field Rep</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    {currentUserEmail === 'admin@clearmarket.com' && (
                      <SelectItem value="DELETE" className="text-destructive font-semibold focus:text-destructive focus:bg-destructive/10">
                        DELETE
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
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
                    onClick={() => setShowImpersonateModal(true)}
                    title="Impersonate User"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mimic User
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

        {/* Impersonation Modal */}
        <Dialog open={showImpersonateModal} onOpenChange={setShowImpersonateModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Start Impersonation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-yellow-600">Security Notice</p>
                    <p className="text-muted-foreground">
                      This action will be logged. You'll view the platform as{' '}
                      <span className="font-medium text-foreground">{user?.display_name}</span> in read-only mode.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason for impersonation <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="e.g., Investigating reported issue with profile visibility..."
                  value={impersonationReason}
                  onChange={(e) => setImpersonationReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters. This will be recorded in the audit log.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImpersonateModal(false);
                    setImpersonationReason("");
                  }}
                  disabled={isImpersonating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImpersonate}
                  disabled={isImpersonating || impersonationReason.length < 10}
                >
                  {isImpersonating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Start Impersonation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog - Admin#1 Only */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">⚠️ PERMANENT DELETION WARNING</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 text-left">
                <p className="font-semibold text-foreground">
                  This action CANNOT be undone and will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Delete user account permanently</li>
                  <li>Remove ALL user data from the database</li>
                  <li>Delete ALL coverage areas</li>
                  <li>Remove ALL messages and connections</li>
                  <li>Delete ALL reviews and ratings</li>
                  <li>Clear ALL credit transactions</li>
                  <li>Remove ALL calendar events</li>
                  <li>Delete ALL documents</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  Deleting: <span className="font-mono font-semibold text-foreground">{user?.email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Only Admin#1 can perform this operation.
                </p>
                <div className="mt-4">
                  <Label htmlFor="delete-confirm" className="text-sm font-medium">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="mt-2"
                    autoComplete="off"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Users, Save, Eye, Search, RefreshCw, ChevronUp, ChevronDown, Filter, Shield, Key, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ConnectionLimitManager } from "./ConnectionLimitManager";

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

type SortField = 'username' | 'email' | 'role' | 'trust_score' | 'community_score' | 'join_date' | 'last_active';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

export const RoleAssignment = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [statusChanges, setStatusChanges] = useState<Record<string, boolean>>({});
  const [impersonateUser, setImpersonateUser] = useState<UserProfile | null>(null);
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedUserForLimit, setSelectedUserForLimit] = useState<UserProfile | null>(null);
  const [resetLinkUser, setResetLinkUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users with their data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, role, trust_score, community_score, display_name, anonymous_username, last_active');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
        return;
      }

      // Try to get additional profile data from user_profiles (optional)
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, phone, join_date, is_active');

      // Combine the data - users table is the source of truth
      const combinedData = usersData?.map(user => {
        const profile = profilesData?.find(p => p.user_id === user.id);
        return {
          id: user.id,
          user_id: user.id,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          username: user.anonymous_username || user.display_name || 'Unknown',
          email: user.email || 'No email',
          phone: profile?.phone || null,
          join_date: profile?.join_date || new Date().toISOString(),
          is_active: profile?.is_active ?? true,
          role: user.role,
          trust_score: user.trust_score || 0,
          community_score: user.community_score || 0,
          display_name: user.display_name || user.anonymous_username || 'Unknown',
          last_active: user.last_active || null
        };
      }) || [];

      setUsers(combinedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleStatusChange = (userId: string, currentStatus: boolean) => {
    setStatusChanges(prev => ({
      ...prev,
      [userId]: !currentStatus
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const saveRoleChanges = async () => {
    try {
      // Handle role changes
      const roleChangePromises = Object.entries(pendingChanges).map(async ([userId, newRole]) => {
        // Validate role
        const validRoles = ['admin', 'moderator', 'vendor', 'field_rep'];
        if (!validRoles.includes(newRole)) {
          throw new Error(`Invalid role: ${newRole}`);
        }

        // Prevent non-admin from assigning admin role
        if (newRole === 'admin') {
          toast({
            title: "Warning",
            description: "Admin role assignment requires special permissions",
            variant: "destructive"
          });
          return;
        }

        const { data, error } = await supabase.rpc('admin_update_user_role', {
          target_user_id: userId,
          new_role: newRole as any
        });

        if (error) throw error;

        // Log the change to audit log
        await supabase.from('audit_log').insert({
          user_id: userId,
          action: 'role_change',
          target_table: 'users',
          target_id: userId,
          metadata: {
            new_role: newRole,
            changed_by: 'admin'
          }
        });

        return data;
      });

      // Handle status changes
      const statusChangePromises = Object.entries(statusChanges).map(async ([userId, newStatus]) => {
        const { error } = await supabase.rpc('toggle_user_activation', {
          target_user_id: userId,
          is_active_param: newStatus
        });

        if (error) throw error;
        return true;
      });

      await Promise.all([...roleChangePromises, ...statusChangePromises]);

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });

      setPendingChanges({});
      setStatusChanges({});
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleImpersonate = (user: UserProfile) => {
    setImpersonateUser(user);
    toast({
      title: "Impersonation Started",
      description: `You are now impersonating ${user.display_name}`,
    });
  };

  const generatePasswordResetLink = async (user: UserProfile) => {
    try {
      setResetLinkUser(user);

      // Trigger Supabase's built-in password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      // Log the action to audit log
      await supabase.from('audit_log').insert({
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
      
      // Close the modal after short delay
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

  const copyResetLink = () => {
    // Deprecated - no longer used
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const currentStatus = statusChanges[user.user_id] !== undefined 
        ? statusChanges[user.user_id] 
        : user.is_active;
      
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'active' && currentStatus) ||
        (statusFilter === 'inactive' && !currentStatus);

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'username':
          aValue = a.username || a.display_name || '';
          bValue = b.username || b.display_name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        case 'trust_score':
          aValue = a.trust_score || 0;
          bValue = b.trust_score || 0;
          break;
        case 'community_score':
          aValue = a.community_score || 0;
          bValue = b.community_score || 0;
          break;
        case 'join_date':
          aValue = new Date(a.join_date || 0);
          bValue = new Date(b.join_date || 0);
          break;
        case 'last_active':
          aValue = a.last_active ? new Date(a.last_active) : new Date(0);
          bValue = b.last_active ? new Date(b.last_active) : new Date(0);
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  const hasChanges = Object.keys(pendingChanges).length > 0 || Object.keys(statusChanges).length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users & Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users & Directory
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasChanges && (
              <Button onClick={saveRoleChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>

          {filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search criteria
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="username">User</SortableHeader>
                    <SortableHeader field="email">Email</SortableHeader>
                    <TableHead>Phone</TableHead>
                    <SortableHeader field="role">Current Role</SortableHeader>
                    <TableHead>New Role</TableHead>
                    <SortableHeader field="trust_score">Trust Score</SortableHeader>
                    <SortableHeader field="community_score">Pulse Score</SortableHeader>
                    <SortableHeader field="join_date">Join Date</SortableHeader>
                    <SortableHeader field="last_active">Last Active</SortableHeader>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => {
                    const currentRole = pendingChanges[user.user_id] || user.role;
                    const currentStatus = statusChanges[user.user_id] !== undefined 
                      ? statusChanges[user.user_id] 
                      : user.is_active;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.first_name} {user.last_name}
                            </span>
                            <span className="text-sm text-muted-foreground">@{user.username || user.display_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Select
                            value={currentRole}
                            onValueChange={(value) => handleRoleChange(user.user_id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="field_rep">Field Rep</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{user.trust_score || 0}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{user.community_score || 0}</span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.join_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {user.last_active ? (
                            <span className="text-sm">{format(new Date(user.last_active), 'MMM dd, yyyy')}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(currentStatus)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={currentStatus}
                            onCheckedChange={() => handleStatusChange(user.user_id, user.is_active)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUserForLimit(user)}
                              title="Manage Connection Limits"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generatePasswordResetLink(user)}
                              title="Generate Password Reset Link"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleImpersonate(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Impersonate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {/* Connection Limit Management Modal */}
      <Dialog open={!!selectedUserForLimit} onOpenChange={(open) => !open && setSelectedUserForLimit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Connection Request Limits</DialogTitle>
          </DialogHeader>
          {selectedUserForLimit && (
            <ConnectionLimitManager
              userId={selectedUserForLimit.user_id}
              displayName={selectedUserForLimit.display_name}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={!!resetLinkUser} onOpenChange={(open) => {
        if (!open) {
          setResetLinkUser(null);
        }
      }}>
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
    </Card>
  );
};
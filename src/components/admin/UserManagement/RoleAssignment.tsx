import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Users, Save, Eye, Search, RefreshCw, ChevronUp, ChevronDown, Filter, Shield, Key, Download, Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
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
  join_date: string | null;
  is_active: boolean;
  role: string;
  trust_score: number;
  community_score: number;
  display_name: string;
  last_active: string | null;
  city: string | null;
  state: string | null;
  background_check_status: string | null;
  company_name: string | null;
}

type SortField = 'username' | 'email' | 'role' | 'trust_score' | 'community_score' | 'join_date' | 'last_active';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

interface ColumnConfig {
  key: string;
  label: string;
  enabled: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'user', label: 'User', enabled: true },
  { key: 'email', label: 'Email', enabled: true },
  { key: 'phone', label: 'Phone', enabled: false },
  { key: 'location', label: 'User Location', enabled: false },
  { key: 'company_name', label: 'Vendor Company Name', enabled: false },
  { key: 'background_check', label: 'Background Check Status', enabled: false },
  { key: 'current_role', label: 'Current Role', enabled: true },
  { key: 'new_role', label: 'New Role', enabled: true },
  { key: 'trust_score', label: 'Trust Score', enabled: true },
  { key: 'pulse_score', label: 'Pulse Score', enabled: false },
  { key: 'join_date', label: 'Join Date', enabled: true },
  { key: 'last_active', label: 'Last Active', enabled: true },
  { key: 'status', label: 'Status', enabled: false },
  { key: 'actions', label: 'Actions', enabled: true },
];

export const RoleAssignment = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, { 
    role?: "admin" | "moderator" | "field_rep" | "vendor";
    is_active?: boolean;
  }>>({});
  const [impersonateUser, setImpersonateUser] = useState<UserProfile | null>(null);
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedUserForLimit, setSelectedUserForLimit] = useState<UserProfile | null>(null);
  const [resetLinkUser, setResetLinkUser] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ userId: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Column visibility management - merge saved with defaults to include new columns
  const [visibleColumns, setVisibleColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('admin_users_columns');
    if (!saved) return DEFAULT_COLUMNS;
    
    const savedColumns = JSON.parse(saved) as ColumnConfig[];
    const savedKeys = new Set(savedColumns.map(col => col.key));
    
    // Add any new columns from DEFAULT_COLUMNS that aren't in saved
    const newColumns = DEFAULT_COLUMNS.filter(col => !savedKeys.has(col.key));
    const merged = [...savedColumns, ...newColumns];
    
    // Save merged columns back to localStorage
    localStorage.setItem('admin_users_columns', JSON.stringify(merged));
    
    return merged;
  });

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

      // Get additional profile data from user_profiles and field_rep_profiles
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, phone, join_date, is_active');

      const { data: fieldRepData } = await supabase
        .from('field_rep_profiles')
        .select('user_id, city, state');

      // Get vendor company names via vendor_staff_members -> vendor_organizations join
      const { data: vendorStaffData } = await supabase
        .from('vendor_staff_members')
        .select(`
          user_id,
          vendor_organizations (
            company_name
          )
        `);

      // Combine the data - users table is the source of truth
      const combinedData = usersData?.map(user => {
        const profile = profilesData?.find(p => p.user_id === user.id);
        const fieldRep = fieldRepData?.find(p => p.user_id === user.id);
        const vendorStaff = vendorStaffData?.find(p => p.user_id === user.id);
        const vendorOrg = vendorStaff?.vendor_organizations as any;
        
        return {
          id: user.id,
          user_id: user.id,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          username: user.anonymous_username || user.display_name || 'Unknown',
          email: user.email || 'No email',
          phone: profile?.phone || null,
          join_date: profile?.join_date || null,
          is_active: profile?.is_active ?? true,
          role: user.role,
          trust_score: user.trust_score || 0,
          community_score: user.community_score || 0,
          display_name: user.display_name || user.anonymous_username || 'Unknown',
          last_active: user.last_active || null,
          city: fieldRep?.city || null,
          state: fieldRep?.state || null,
          background_check_status: null, // TODO: Add when background check table is available
          company_name: vendorOrg?.company_name || null
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

  const handleRoleChange = (userId: string, value: string, userName: string) => {
    if (value === 'DELETE') {
      setUserToDelete({ userId, name: userName });
      setDeleteDialogOpen(true);
      return;
    }

    const isInactive = value === 'inactive';
    
    setPendingChanges(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...(isInactive ? {} : { role: value as "admin" | "moderator" | "field_rep" | "vendor" }),
        is_active: !isInactive
      }
    }));
  };

  const handleDeleteUser = async () => {
    if (deleteConfirmText !== "DELETE" || !userToDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('admin_delete_user_completely', {
        target_user_id: userToDelete.userId
      });

      if (error) throw error;

      // Check if the function returned an error in the response
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success === false) {
          const errorMsg = typeof data.error === 'string' ? data.error : 'Failed to delete user';
          throw new Error(errorMsg);
        }
      }

      sonnerToast.success("User deleted completely", {
        description: `${userToDelete.name} has been permanently removed from the system.`
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setDeleteConfirmText("");
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      sonnerToast.error("Failed to delete user", {
        description: error.message || "An unexpected error occurred"
      });
      // Keep dialog open on error so user can see the message
    } finally {
      setIsDeleting(false);
    }
  };

  const getCurrentRole = (user: UserProfile) => {
    const changes = pendingChanges[user.user_id];
    if (changes) {
      if (changes.is_active === false) return 'inactive';
      if (changes.role !== undefined) return changes.role;
    }
    return user.is_active ? user.role : 'inactive';
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
      for (const [userId, changes] of Object.entries(pendingChanges)) {
        // Update role if changed
        if (changes.role !== undefined) {
          // Validate role
          const validRoles = ['admin', 'moderator', 'vendor', 'field_rep'];
          if (!validRoles.includes(changes.role)) {
            throw new Error(`Invalid role: ${changes.role}`);
          }

          // Prevent non-admin from assigning admin role
          if (changes.role === 'admin') {
            toast({
              title: "Warning",
              description: "Admin role assignment requires special permissions",
              variant: "destructive"
            });
            continue;
          }

          const { error: roleError } = await supabase.rpc('admin_update_user_role', {
            target_user_id: userId,
            new_role: changes.role as any
          });

          if (roleError) throw roleError;

          // Log the change to audit log
          await supabase.from('audit_log').insert({
            user_id: userId,
            action: 'role_change',
            target_table: 'users',
            target_id: userId,
            metadata: {
              new_role: changes.role,
              changed_by: 'admin'
            }
          });
        }

        // Update is_active if changed
        if (changes.is_active !== undefined) {
          const { error: statusError } = await supabase.rpc('toggle_user_activation', {
            target_user_id: userId,
            is_active_param: changes.is_active
          });

          if (statusError) throw statusError;
        }
      }

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });

      setPendingChanges({});
      fetchUsers();
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        throw resetError;
      }

      console.log('Password reset email sent, now logging to audit log...');

      // Get current user for audit log
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      console.log('Current user:', currentUser?.id, 'Error:', userError);

      // Log the action to audit log
      const auditData = {
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
      };

      console.log('Attempting to insert audit log:', auditData);

      const { data: auditResult, error: auditError } = await supabase
        .from('audit_log')
        .insert(auditData);

      if (auditError) {
        console.error('Audit log insert error:', auditError);
        toast({
          title: "Warning",
          description: "Password reset sent but failed to log action",
          variant: "default",
        });
      } else {
        console.log('Audit log insert successful:', auditResult);
      }

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

  const toggleColumn = (key: string) => {
    const updated = visibleColumns.map(col => 
      col.key === key ? { ...col, enabled: !col.enabled } : col
    );
    setVisibleColumns(updated);
    localStorage.setItem('admin_users_columns', JSON.stringify(updated));
  };

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = visibleColumns
      .filter(col => col.enabled)
      .map(col => col.label)
      .join(',');

    // Prepare CSV rows
    const rows = filteredAndSortedUsers.map(user => {
      const currentRole = getCurrentRole(user);
      const changes = pendingChanges[user.user_id];
      const currentStatus = changes?.is_active !== undefined 
        ? changes.is_active 
        : user.is_active;

      const rowData: Record<string, string> = {
        user: `"${user.first_name} ${user.last_name} (@${user.username || user.display_name})"`,
        email: user.email,
        phone: user.phone || '-',
        location: user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || '-',
        company_name: user.company_name || '-',
        background_check: user.background_check_status || '-',
        current_role: user.role,
        new_role: currentRole,
        trust_score: String(user.trust_score || 0),
        pulse_score: String(user.community_score || 0),
        join_date: user.join_date ? format(new Date(user.join_date), 'MMM dd, yyyy') : 'Not set',
        last_active: user.last_active ? format(new Date(user.last_active), 'MMM dd, yyyy') : 'Never',
        status: currentStatus ? 'Active' : 'Deactivated',
        actions: 'N/A',
      };

      return visibleColumns
        .filter(col => col.enabled)
        .map(col => rowData[col.key])
        .join(',');
    });

    // Create CSV content
    const csv = [headers, ...rows].join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredAndSortedUsers.length} users to CSV`,
    });
  };

  const isColumnVisible = (key: string) => {
    return visibleColumns.find(col => col.key === key)?.enabled ?? false;
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

      // Status filter - check pending changes first
      const changes = pendingChanges[user.user_id];
      const currentStatus = changes?.is_active !== undefined 
        ? changes.is_active 
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

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
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
          Users
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div className="font-semibold text-sm">Customize Columns</div>
                <div className="space-y-3">
                  {visibleColumns.map((col) => (
                    <div key={col.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={col.key}
                        checked={col.enabled}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label
                        htmlFor={col.key}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    {isColumnVisible('user') && <SortableHeader field="username">User</SortableHeader>}
                    {isColumnVisible('email') && <SortableHeader field="email">Email</SortableHeader>}
                    {isColumnVisible('phone') && <TableHead>Phone</TableHead>}
                    {isColumnVisible('location') && <TableHead>Location</TableHead>}
                    {isColumnVisible('company_name') && <TableHead>Company Name</TableHead>}
                    {isColumnVisible('background_check') && <TableHead>Background Check</TableHead>}
                    {isColumnVisible('current_role') && <SortableHeader field="role">Current Role</SortableHeader>}
                    {isColumnVisible('new_role') && <TableHead>Role / Status</TableHead>}
                    {isColumnVisible('trust_score') && <SortableHeader field="trust_score">Trust Score</SortableHeader>}
                    {isColumnVisible('pulse_score') && <SortableHeader field="community_score">Pulse Score</SortableHeader>}
                    {isColumnVisible('join_date') && <SortableHeader field="join_date">Join Date</SortableHeader>}
                    {isColumnVisible('last_active') && <SortableHeader field="last_active">Last Active</SortableHeader>}
                    {isColumnVisible('status') && <TableHead>Status</TableHead>}
                    {isColumnVisible('actions') && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => {
                    const currentRole = getCurrentRole(user);
                    const userName = `${user.first_name} ${user.last_name}`;
                    const changes = pendingChanges[user.user_id];
                    const currentStatus = changes?.is_active !== undefined 
                      ? changes.is_active 
                      : user.is_active;
                    
                    return (
                      <TableRow key={user.id}>
                        {isColumnVisible('user') && (
                          <TableCell>
                            <button 
                              onClick={() => navigate(`/admin/users/${user.user_id}`)}
                              className="flex flex-col text-left hover:underline focus:outline-none focus:underline"
                            >
                              <span className="font-medium text-primary">
                                {user.first_name} {user.last_name}
                              </span>
                              <span className="text-sm text-muted-foreground">@{user.username || user.display_name}</span>
                            </button>
                          </TableCell>
                        )}
                        {isColumnVisible('email') && <TableCell>{user.email}</TableCell>}
                        {isColumnVisible('phone') && <TableCell>{user.phone || '-'}</TableCell>}
                        {isColumnVisible('location') && (
                          <TableCell>
                            {user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || '-'}
                          </TableCell>
                        )}
                        {isColumnVisible('company_name') && (
                          <TableCell>{user.company_name || '-'}</TableCell>
                        )}
                        {isColumnVisible('background_check') && (
                          <TableCell>
                            {user.background_check_status ? (
                              <Badge variant={user.background_check_status === 'verified' ? 'default' : 'secondary'}>
                                {user.background_check_status}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                        )}
                        {isColumnVisible('current_role') && <TableCell>{getRoleBadge(user.role)}</TableCell>}
                        {isColumnVisible('new_role') && (
                          <TableCell>
                            <Select
                              value={currentRole}
                              onValueChange={(value) => handleRoleChange(user.user_id, value, userName)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="field_rep">Field Rep</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="DELETE" className="text-destructive font-semibold">
                                  DELETE
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                        {isColumnVisible('trust_score') && (
                          <TableCell>
                            <span className="text-sm font-medium">{user.trust_score || 0}</span>
                          </TableCell>
                        )}
                        {isColumnVisible('pulse_score') && (
                          <TableCell>
                            <span className="text-sm font-medium">{user.community_score || 0}</span>
                          </TableCell>
                        )}
                        {isColumnVisible('join_date') && (
                          <TableCell>
                            {user.join_date ? (
                              format(new Date(user.join_date), 'MMM dd, yyyy')
                            ) : (
                              <span className="text-sm text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                        )}
                        {isColumnVisible('last_active') && (
                          <TableCell>
                            {user.last_active ? (
                              <span className="text-sm">{format(new Date(user.last_active), 'MMM dd, yyyy')}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                        )}
                        {isColumnVisible('status') && <TableCell>{getStatusBadge(currentStatus)}</TableCell>}
                        {isColumnVisible('actions') && (
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
                                title="Impersonate User"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete User Permanently</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold">
                You are about to permanently delete: {userToDelete?.name}
              </p>
              <p className="text-sm">
                This will immediately and permanently remove:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>User account and authentication</li>
                <li>Profile information</li>
                <li>All messages and communications</li>
                <li>Network connections</li>
                <li>All activity history</li>
              </ul>
              <p className="font-semibold text-destructive mt-4">
                ⚠️ THIS ACTION CANNOT BE UNDONE
              </p>
              <p className="text-sm mt-4">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="font-mono"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmText("");
                setUserToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
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
    </Card>
  );
};
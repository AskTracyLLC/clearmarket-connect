import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Users, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast as sonnerToast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

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
  role: "admin" | "moderator" | "field_rep" | "vendor";
}

export const UserDirectory = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { 
    role?: "admin" | "moderator" | "field_rep" | "vendor"; 
    is_active?: boolean 
  }>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ userId: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      // Fetch user profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch user roles
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, role')
        .in('role', ['admin', 'moderator']);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Combine profiles with roles
      const combinedData = profiles?.map(profile => {
        const userRole = usersData?.find(user => user.id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || 'field_rep'
        };
      }).filter(user => user.role === 'admin' || user.role === 'moderator') || [];

      setUsers(combinedData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Subscribe to realtime changes on user_profiles
  useRealtimeSubscription('user_profiles', (payload) => {
    console.log('User profiles changed:', payload);
    fetchUsers();
  });

  // Subscribe to realtime changes on users table (for role updates)
  useRealtimeSubscription('users', (payload) => {
    console.log('Users changed:', payload);
    fetchUsers();
  });

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
      const { error } = await supabase.rpc('admin_delete_user_completely', {
        target_user_id: userToDelete.userId
      });

      if (error) throw error;

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
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const saveChanges = async () => {
    try {
      for (const [userId, changes] of Object.entries(pendingChanges)) {
        // Update role if changed
        if (changes.role !== undefined) {
          const { error: roleError } = await supabase
            .from('users')
            .update({ role: changes.role })
            .eq('id', userId);

          if (roleError) throw roleError;
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

      sonnerToast.success("Changes saved successfully", {
        description: "User roles and statuses updated"
      });

      setPendingChanges({});
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating users:', error);
      sonnerToast.error("Failed to save changes", {
        description: error.message
      });
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

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Directory
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
          User Directory
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {hasChanges && (
            <Button variant="default" size="sm" onClick={saveChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No admin or moderator users found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Role / Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const currentRole = getCurrentRole(user);
                  const userName = `${user.first_name} ${user.last_name}`;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {userName}
                      </TableCell>
                      <TableCell>{user.username || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(user.join_date), 'MMM dd, yyyy')}
                      </TableCell>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

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
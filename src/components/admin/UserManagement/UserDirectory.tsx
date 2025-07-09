import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Users, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

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
}

export const UserDirectory = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

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

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: !currentStatus
    }));
  };

  const saveChanges = async () => {
    try {
      for (const [userId, newStatus] of Object.entries(pendingChanges)) {
        const { error } = await supabase.rpc('toggle_user_activation', {
          target_user_id: userId,
          is_active_param: newStatus
        });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "User statuses updated successfully",
      });

      setPendingChanges({});
      fetchUsers(); // Refresh the data
    } catch (error: any) {
      console.error('Error updating user statuses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user statuses",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variant = role === 'admin' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{role.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Deactivated'}
      </Badge>
    );
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
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const currentStatus = pendingChanges[user.user_id] !== undefined 
                    ? pendingChanges[user.user_id] 
                    : user.is_active;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.username || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {format(new Date(user.join_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(currentStatus)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={currentStatus}
                          onCheckedChange={() => handleToggleActive(user.user_id, user.is_active)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
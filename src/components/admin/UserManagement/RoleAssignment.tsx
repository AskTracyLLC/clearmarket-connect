import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { isValidUserRole } from "@/utils/security";
import { UserCog, Search, RefreshCw, Eye, Save, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  display_name: string;
}

export const RoleAssignment = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [impersonateUser, setImpersonateUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('join_date', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch user roles and additional info
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, role, trust_score, display_name');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Combine profiles with user data
      const combinedData = profiles?.map(profile => {
        const userInfo = usersData?.find(user => user.id === profile.user_id);
        return {
          ...profile,
          role: userInfo?.role || 'field_rep',
          trust_score: userInfo?.trust_score || 0,
          display_name: userInfo?.display_name || `${profile.first_name} ${profile.last_name}`
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
    // Validate role before accepting the change
    if (!isValidUserRole(newRole)) {
      toast({
        title: "Security Error",
        description: "Invalid role selected",
        variant: "destructive"
      });
      return;
    }

    setPendingChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const saveRoleChanges = async () => {
    try {
      // Additional security check before batch update
      const invalidRoles = Object.values(pendingChanges).filter(role => !isValidUserRole(role));
      if (invalidRoles.length > 0) {
        toast({
          title: "Security Error",
          description: "One or more invalid roles detected. Changes rejected.",
          variant: "destructive"
        });
        return;
      }

      // Show confirmation for sensitive role changes
      const hasAdminChanges = Object.values(pendingChanges).some(role => role === 'admin');
      if (hasAdminChanges) {
        const confirmed = window.confirm(
          "⚠️ You are about to assign admin privileges. This action grants full system access. Are you sure you want to continue?"
        );
        if (!confirmed) {
          return;
        }
      }

      for (const [userId, newRole] of Object.entries(pendingChanges)) {
        const { error } = await supabase
          .from('users')
          .update({ role: newRole as any })
          .eq('id', userId);

        if (error) {
          throw error;
        }

        // Log the role change for audit purposes
        await supabase
          .from('audit_log')
          .insert({
            action: 'role_change',
            target_table: 'users',
            target_id: userId,
            metadata: {
              new_role: newRole,
              changed_at: new Date().toISOString()
            }
          });
      }

      toast({
        title: "Success",
        description: "User roles updated successfully",
      });

      setPendingChanges({});
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating roles:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user roles",
        variant: "destructive"
      });
    }
  };

  const handleImpersonate = (user: UserProfile) => {
    setImpersonateUser(user);
    // In a real implementation, this would switch the session context
    toast({
      title: "Impersonation Mode",
      description: `Now viewing as ${user.display_name}. This is a simulation.`,
    });
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
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Role Assignment
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
          <UserCog className="h-5 w-5" />
          Role Assignment & User Management
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {hasChanges && (
            <Button variant="default" size="sm" onClick={saveRoleChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes ({Object.keys(pendingChanges).length})
              {Object.values(pendingChanges).some(role => role === 'admin') && (
                <AlertTriangle className="h-3 w-3 ml-1 text-destructive" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your search
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>New Role</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const pendingRole = pendingChanges[user.user_id];
                  const displayRole = pendingRole || user.role;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{user.display_name}</div>
                          <div className="text-sm text-muted-foreground">@{user.username || 'no-username'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Select 
                          value={displayRole} 
                          onValueChange={(value) => handleRoleChange(user.user_id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="field_rep">Field Rep</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="moderator">
                              <span className="flex items-center gap-1">
                                Moderator
                              </span>
                            </SelectItem>
                            <SelectItem value="admin">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                                Admin
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {pendingRole && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Changed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{user.trust_score}</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${Math.min(user.trust_score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Impersonate
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Impersonate User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">{user.display_name}</h4>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                  {getRoleBadge(user.role)}
                                  {getStatusBadge(user.is_active)}
                                </div>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                  ⚠️ This is a simulation. In production, this would allow you to view the platform from this user's perspective for support purposes.
                                </p>
                              </div>
                              <Button 
                                onClick={() => handleImpersonate(user)}
                                className="w-full"
                              >
                                Simulate Impersonation
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
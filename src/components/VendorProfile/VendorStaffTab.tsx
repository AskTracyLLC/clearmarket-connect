import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useVendorStaff } from '@/hooks/useVendorStaff';
import { AddStaffModal } from './AddStaffModal';
import { UserPlus, MoreHorizontal, Shield, User, Crown } from 'lucide-react';
import { format } from 'date-fns';

const VendorStaffTab = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { staff, vendorOrg, currentUserRole, loading, refetch, updateStaffRole, removeStaffMember } = useVendorStaff();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'staff':
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'staff':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isAdmin = currentUserRole === 'admin';
  const activeStaff = staff.filter(member => member.is_active);
  const inactiveStaff = staff.filter(member => !member.is_active);

  if (!vendorOrg) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You need to be part of a vendor organization to manage staff.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Staff Management
              </CardTitle>
              <CardDescription>
                Manage your team members for {vendorOrg.company_name}
              </CardDescription>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Staff Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading staff members...</div>
            </div>
          ) : activeStaff.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No staff members yet</p>
              <p className="text-sm">
                {isAdmin ? "Add your first team member to get started." : "Contact your admin to add team members."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Staff ({activeStaff.length})</h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.users.display_name || member.users.anonymous_username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => updateStaffRole(member.id, 'admin')}
                                disabled={member.role === 'admin'}
                              >
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateStaffRole(member.id, 'manager')}
                                disabled={member.role === 'manager'}
                              >
                                Make Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateStaffRole(member.id, 'staff')}
                                disabled={member.role === 'staff'}
                              >
                                Make Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => removeStaffMember(member.id)}
                                className="text-destructive"
                              >
                                Remove from team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {inactiveStaff.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Inactive Staff ({inactiveStaff.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Removed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveStaff.map((member) => (
                    <TableRow key={member.id} className="opacity-60">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.users.display_name || member.users.anonymous_username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        vendorOrgId={vendorOrg?.id || null}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default VendorStaffTab;
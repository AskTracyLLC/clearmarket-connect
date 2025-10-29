import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUserForm } from "./CreateUserForm";
import { InvitationStatus } from "./InvitationStatus";
import { RoleAssignment } from "./RoleAssignment";
import { UserActivityLog } from "../UserActivityLog";
import { UserPlus, Mail, Users, ClipboardList } from "lucide-react";

export const UserManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserInvited = () => {
    // Trigger refresh of invitation status
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create User
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <RoleAssignment />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <UserActivityLog />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateUserForm onUserInvited={handleUserInvited} />
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationStatus key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
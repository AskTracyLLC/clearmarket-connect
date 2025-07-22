
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import UserDocuments from "@/components/profile/UserDocuments";
import { AdminBasicInfo } from "./AdminBasicInfo";
import { AdminSystemAccess } from "./AdminSystemAccess";
import { AdminAuditLog } from "./AdminAuditLog";
import { AdminSettings } from "./AdminSettings";
import { Crown, Shield, Settings, FileText, Activity, User } from "lucide-react";

const AdminProfile = () => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Verify admin access
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive"
      });
    }
  }, [profile, toast]);

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Administrative privileges required to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Administrator Profile
            </h1>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your admin profile, system access, and platform oversight
          </p>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Profile Status</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-1">Complete</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Access Level</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">Full Admin</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Storage Used</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">Unlimited</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Last Active</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-1">Now</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Control Panel
          </CardTitle>
          <CardDescription>
            Manage your administrative profile and system access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="access">System Access</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <AdminBasicInfo profile={profile} user={user} />
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Document Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage administrative documents with unlimited storage
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Crown className="h-3 w-3 mr-1" />
                    Unlimited Storage
                  </Badge>
                </div>
                <UserDocuments onDocumentAdded={(doc) => console.log('Admin document added:', doc)} />
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-6 mt-6">
              <AdminSystemAccess />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6 mt-6">
              <AdminAuditLog />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <AdminSettings profile={profile} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;

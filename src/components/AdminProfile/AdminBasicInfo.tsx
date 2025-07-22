
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Calendar, Shield, Crown, Edit3, Save, X } from "lucide-react";
import { format } from "date-fns";

interface AdminBasicInfoProps {
  profile: any;
  user: any;
}

export const AdminBasicInfo = ({ profile, user }: AdminBasicInfoProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState('System Administrator with full platform access and oversight responsibilities.');

  const handleSave = () => {
    // Here you would typically save to database
    toast({
      title: "Profile Updated",
      description: "Your admin profile has been updated successfully."
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '');
    setBio('System Administrator with full platform access and oversight responsibilities.');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                {isEditing ? (
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{displayName || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label>Anonymous Username</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm p-2 bg-muted rounded flex-1">{profile?.anonymous_username}</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user?.email}</p>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Account Created</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Administrative Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your administrative role and responsibilities"
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1 p-3 bg-muted rounded">{bio}</p>
                )}
              </div>

              <div>
                <Label>Role & Permissions</Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">System Administrator</span>
                    <Badge className="bg-purple-100 text-purple-700">Full Access</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Platform Oversight</span>
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label>Trust Score</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-full"></div>
                  </div>
                  <span className="text-sm font-medium">100/100</span>
                  <Badge variant="default">Maximum</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, Infinity, Edit2, Save, X } from "lucide-react";

interface UserLimitInfo {
  user_id: string;
  display_name: string;
  anonymous_username: string;
  role: string;
  trust_badge: string | null;
  custom_limit: number | null;
  effective_limit: number | null;
  is_unlimited: boolean;
  today_count: number;
  remaining_today: number;
}

export const ConnectionLimitManager = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserLimitInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<string>("");

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Search Term",
        description: "Please enter a username or display name to search.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Search for users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, display_name, anonymous_username, role')
        .or(`display_name.ilike.%${searchQuery}%,anonymous_username.ilike.%${searchQuery}%`)
        .limit(20);

      if (userError) throw userError;

      if (!userData || userData.length === 0) {
        toast({
          title: "No Users Found",
          description: "No users match your search query.",
        });
        setUsers([]);
        setIsLoading(false);
        return;
      }

      // Get limit info for each user
      const limitInfoPromises = userData.map(async (user) => {
        const { data: limitInfo } = await supabase
          .rpc('get_user_connection_limit_info', { target_user_id: user.id });

        const info = limitInfo as any;

        return {
          user_id: user.id,
          display_name: user.display_name || user.anonymous_username,
          anonymous_username: user.anonymous_username,
          role: user.role,
          trust_badge: info?.trust_badge || null,
          custom_limit: info?.custom_limit ?? null,
          effective_limit: info?.effective_limit ?? null,
          is_unlimited: info?.is_unlimited || false,
          today_count: info?.today_count || 0,
          remaining_today: info?.remaining_today || 0,
        };
      });

      const usersWithLimits = await Promise.all(limitInfoPromises);
      setUsers(usersWithLimits);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (user: UserLimitInfo) => {
    setEditingUserId(user.user_id);
    setEditLimit(user.custom_limit !== null ? String(user.custom_limit) : "");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditLimit("");
  };

  const saveLimit = async (userId: string) => {
    try {
      const newLimit = editLimit.trim() === "" ? null : parseInt(editLimit);

      if (newLimit !== null && (isNaN(newLimit) || newLimit < 0)) {
        toast({
          title: "Invalid Limit",
          description: "Please enter a valid positive number or leave empty for unlimited.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .rpc('admin_set_connection_request_limit', {
          target_user_id: userId,
          new_limit: newLimit
        });

      if (error) throw error;

      toast({
        title: "Limit Updated",
        description: newLimit === null 
          ? "User now has unlimited connection requests."
          : `Daily limit set to ${newLimit} requests.`,
      });

      // Refresh the user list
      await searchUsers();
      cancelEdit();
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update connection request limit.",
        variant: "destructive",
      });
    }
  };

  const getTrustBadgeColor = (badge: string | null) => {
    switch (badge) {
      case 'verified_pro': return 'bg-purple-500';
      case 'trusted': return 'bg-blue-500';
      case 'reputable': return 'bg-green-500';
      case 'reliable': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Connection Request Limit Manager
        </CardTitle>
        <CardDescription>
          Manage daily connection request limits for users. Trusted vendors automatically get unlimited requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Enter username or display name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={searchUsers} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Default Limits Info */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="font-medium">Default Limits:</p>
          <ul className="text-sm space-y-1">
            <li>• Vendors: 5 requests/day</li>
            <li>• Field Reps: 10 requests/day</li>
            <li>• Trusted/Verified Pro: Unlimited</li>
          </ul>
        </div>

        {/* Results */}
        {users.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium">{users.length} user(s) found:</p>
            {users.map((user) => (
              <div key={user.user_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.display_name}</p>
                      <Badge variant="outline">{user.anonymous_username}</Badge>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                      {user.trust_badge && (
                        <Badge className={getTrustBadgeColor(user.trust_badge)}>
                          {user.trust_badge.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Custom Limit</p>
                    <p className="font-medium">
                      {user.custom_limit !== null ? user.custom_limit : "Not Set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Effective Limit</p>
                    <p className="font-medium flex items-center gap-1">
                      {user.is_unlimited ? (
                        <>
                          <Infinity className="h-4 w-4" />
                          Unlimited
                        </>
                      ) : (
                        user.effective_limit
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Today's Usage</p>
                    <p className="font-medium">
                      {user.today_count} sent
                      {!user.is_unlimited && ` / ${user.remaining_today} remaining`}
                    </p>
                  </div>
                </div>

                {/* Edit Section */}
                {editingUserId === user.user_id ? (
                  <div className="flex items-end gap-2 pt-2">
                    <div className="flex-1">
                      <Label htmlFor={`limit-${user.user_id}`}>New Daily Limit</Label>
                      <Input
                        id={`limit-${user.user_id}`}
                        type="number"
                        min="0"
                        placeholder="Enter number or leave empty for unlimited"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                      />
                    </div>
                    <Button size="sm" onClick={() => saveLimit(user.user_id)}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end pt-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit Limit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
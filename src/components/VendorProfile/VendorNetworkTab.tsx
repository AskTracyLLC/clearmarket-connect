import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, MessageSquare } from "lucide-react";
import { useNetworkConnections } from "@/hooks/useNetworkConnections";
import { useNavigate } from "react-router-dom";

const VendorNetworkTab = () => {
  const { connections, isLoading } = useNetworkConnections();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connections.length}</p>
                <p className="text-xs text-muted-foreground">Total Network Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connections.length}</p>
                <p className="text-xs text-muted-foreground">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {connections.filter(c => c.connection_method === 'unlocked').length}
                </p>
                <p className="text-xs text-muted-foreground">Via Search/Unlock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Management */}
      <Card>
        <CardHeader>
          <CardTitle>My Network</CardTitle>
          <CardDescription>
            Field representatives in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading network...
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">No network connections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building your network by searching for field reps in your coverage areas
                </p>
                <Button onClick={() => navigate('/field-rep-search')}>
                  Search Field Reps
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {connection.display_name || connection.anonymous_username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {connection.role === 'field_rep' ? 'Field Rep' : 'Vendor'} • 
                        {connection.connection_method === 'unlocked' ? ' Unlocked' : 
                         connection.connection_method === 'referral' ? ' Referral' : 
                         ' Invitation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorNetworkTab;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Coins, Search, Save, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserCredit {
  user_id: string;
  current_balance: number;
  earned_credits: number;
  paid_credits: number;
  updated_at: string;
  user?: {
    display_name: string;
    role: string;
    trust_score?: number;
  };
  field_rep_name?: string;
  vendor_company?: string;
}

interface TrustScoreUpdate {
  userId: string;
  newScore: number;
  reason: string;
}

export const CreditOverrides = () => {
  const [users, setUsers] = useState<UserCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserCredit | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState("");
  const [trustScoreUpdates, setTrustScoreUpdates] = useState<Record<string, number>>({});

  const fetchUsers = async () => {
    try {
      // Get credits data first
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .order('updated_at', { ascending: false });

      if (creditsError) throw creditsError;

      // Get user data separately
      const userIds = creditsData?.map(credit => credit.user_id) || [];
      let usersData = [];
      let fieldRepData: any[] = [];
      let vendorData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, display_name, anonymous_username, role, trust_score')
          .in('id', userIds);
        usersData = userData || [];

        // Get field rep profiles
        const { data: fieldReps } = await supabase
          .from('field_rep_profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        fieldRepData = fieldReps || [];

        // Get vendor profiles
        const { data: vendors } = await supabase
          .from('vendor_profiles')
          .select('user_id, company_name')
          .in('user_id', userIds);
        vendorData = vendors || [];
      }
      
      const formattedData = creditsData?.map(credit => {
        const user = usersData.find(u => u.id === credit.user_id);
        const fieldRep = fieldRepData.find(fr => fr.user_id === credit.user_id);
        const vendor = vendorData.find(v => v.user_id === credit.user_id);
        
        let displayName = user?.display_name || user?.anonymous_username || "Anonymous User";
        
        // Override with specific profile data
        if (user?.role === 'field_rep' && fieldRep) {
          displayName = `${fieldRep.first_name} ${fieldRep.last_name}`.trim() || displayName;
        } else if (user?.role === 'vendor' && vendor) {
          displayName = vendor.company_name || displayName;
        }
        
        return {
          ...credit,
          user: {
            display_name: displayName,
            role: user?.role || "field_rep",
            trust_score: user?.trust_score
          },
          field_rep_name: fieldRep ? `${fieldRep.first_name} ${fieldRep.last_name}`.trim() : undefined,
          vendor_company: vendor?.company_name
        };
      }) || [];
      
      setUsers(formattedData);
    } catch (error: any) {
      console.error('Error fetching user credits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user credits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreditAdjustment = async (type: 'grant' | 'deduct') => {
    if (!selectedUser || creditAmount <= 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const finalAmount = type === 'deduct' ? -creditAmount : creditAmount;

      // Record the credit transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: selectedUser.user_id,
          amount: finalAmount,
          transaction_type: type === 'grant' ? 'earned' : 'spent',
          reference_type: 'admin_override',
          reference_id: user.id,
          metadata: {
            reason: creditReason,
            admin_id: user.id,
            manual_adjustment: true
          }
        });

      if (transactionError) throw transactionError;

      // Update user's credit balance
      const newBalance = selectedUser.current_balance + finalAmount;
      const { error: updateError } = await supabase
        .from('credits')
        .update({
          current_balance: newBalance,
          ...(type === 'grant' && { earned_credits: selectedUser.earned_credits + creditAmount }),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUser.user_id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `${type === 'grant' ? 'Granted' : 'Deducted'} ${creditAmount} credits`,
      });

      // Reset form
      setCreditAmount(0);
      setCreditReason("");
      setSelectedUser(null);
      fetchUsers();

    } catch (error: any) {
      console.error('Error adjusting credits:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to adjust credits",
        variant: "destructive"
      });
    }
  };

  const handleTrustScoreUpdate = async (userId: string) => {
    const newScore = trustScoreUpdates[userId];
    if (newScore === undefined || newScore < 0 || newScore > 100) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ trust_score: newScore })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Trust score updated to ${newScore}`,
      });

      // Remove from pending updates
      setTrustScoreUpdates(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating trust score:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update trust score",
        variant: "destructive"
      });
    }
  };

  const handleTrustScoreChange = (userId: string, score: number) => {
    setTrustScoreUpdates(prev => ({
      ...prev,
      [userId]: score
    }));
  };

  const filteredUsers = users.filter(user =>
    user.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.includes(searchTerm)
  );

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "destructive",
      moderator: "secondary",
      vendor: "default",
      field_rep: "outline"
    };
    return <Badge variant={variants[role] || "outline"}>{role?.replace('_', ' ').toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credit & Trust Score Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userCredit) => {
                  const pendingTrustScore = trustScoreUpdates[userCredit.user_id];
                  const currentTrustScore = (userCredit.user as any)?.trust_score || 0;
                  
                  return (
                    <TableRow key={userCredit.user_id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{userCredit.user?.display_name || "Unknown User"}</div>
                          <div className="text-xs text-muted-foreground">
                            {userCredit.user?.role === 'field_rep' ? 'Field Rep' : 
                             userCredit.user?.role === 'vendor' ? 'Company' : 'User'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(userCredit.user?.role || "field_rep")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{userCredit.current_balance}</span>
                          <span className="text-sm text-muted-foreground">
                            (E: {userCredit.earned_credits}, P: {userCredit.paid_credits})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={pendingTrustScore !== undefined ? pendingTrustScore : currentTrustScore}
                            onChange={(e) => handleTrustScoreChange(userCredit.user_id, Number(e.target.value))}
                            className="w-20"
                          />
                          {pendingTrustScore !== undefined && pendingTrustScore !== currentTrustScore && (
                            <Button 
                              size="sm" 
                              onClick={() => handleTrustScoreUpdate(userCredit.user_id)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedUser(userCredit)}
                            >
                              <Coins className="h-3 w-3 mr-1" />
                              Adjust Credits
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Credit Adjustment</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                  <h4 className="font-semibold">{selectedUser.user?.display_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Current Balance: {selectedUser.current_balance} credits
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Amount</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                                    placeholder="Enter credit amount"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Reason</label>
                                  <Textarea
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    placeholder="Explain the reason for this adjustment..."
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    variant="default" 
                                    onClick={() => handleCreditAdjustment('grant')}
                                    disabled={!creditAmount || !creditReason}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Grant Credits
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleCreditAdjustment('deduct')}
                                    disabled={!creditAmount || !creditReason}
                                  >
                                    <Minus className="h-4 w-4 mr-2" />
                                    Deduct Credits
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

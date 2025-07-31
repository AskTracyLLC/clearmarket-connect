import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Search, RefreshCw, Users, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BetaTester {
  id: string;
  email: string;
  user_type: string;
  name: string | null;
  signup_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  nda_signed?: boolean;
}

export const BetaTesterManagement = () => {
  const { toast } = useToast();
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [resendingEmails, setResendingEmails] = useState<Set<string>>(new Set());

  const fetchBetaTesters = async () => {
    setLoading(true);
    try {
      // Use the database function to get accurate NDA status for each beta tester
      const { data, error } = await supabase.rpc('get_beta_testers_with_nda_status');

      if (error) throw error;
      
      setBetaTesters(data || []);
    } catch (error) {
      console.error('Error fetching beta testers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch beta testers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendBetaEmail = async (betaTester: BetaTester) => {
    setResendingEmails(prev => new Set(prev).add(betaTester.id));
    
    try {
      const { error } = await supabase.functions.invoke('send-beta-confirmation-email', {
        body: {
          signupType: betaTester.user_type.replace('-', '_'), // Convert field-rep to field_rep
          email: betaTester.email,
          anonymous_username: betaTester.name || `${betaTester.user_type}#${betaTester.id.slice(-4)}`,
          credentials: {
            email: betaTester.email,
            password: 'GeneratedPassword123!' // You might want to generate a proper password
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Beta confirmation email sent to ${betaTester.email}`,
      });
    } catch (error) {
      console.error('Error resending beta email:', error);
      toast({
        title: "Error",
        description: `Failed to send email to ${betaTester.email}`,
        variant: "destructive",
      });
    } finally {
      setResendingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(betaTester.id);
        return newSet;
      });
    }
  };

  const toggleActiveStatus = async (betaTester: BetaTester) => {
    try {
      const { error } = await supabase
        .from('beta_testers')
        .update({ is_active: !betaTester.is_active })
        .eq('id', betaTester.id);

      if (error) throw error;

      setBetaTesters(prev => 
        prev.map(bt => 
          bt.id === betaTester.id 
            ? { ...bt, is_active: !bt.is_active }
            : bt
        )
      );

      toast({
        title: "Status Updated",
        description: `Beta tester ${betaTester.is_active ? 'deactivated' : 'activated'}`,
      });
    } catch (error) {
      console.error('Error updating beta tester status:', error);
      toast({
        title: "Error",
        description: "Failed to update beta tester status",
        variant: "destructive",
      });
    }
  };

  const filteredBetaTesters = betaTesters.filter(bt => {
    const matchesSearch = bt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bt.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userTypeFilter === 'all' || bt.user_type === userTypeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: betaTesters.length,
    active: betaTesters.filter(bt => bt.is_active).length,
    fieldReps: betaTesters.filter(bt => bt.user_type === 'field-rep').length,
    vendors: betaTesters.filter(bt => bt.user_type === 'vendor').length,
  };

  useEffect(() => {
    fetchBetaTesters();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total Beta Testers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Field Reps</p>
                <p className="text-2xl font-bold">{stats.fieldReps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Vendors</p>
                <p className="text-2xl font-bold">{stats.vendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beta Tester Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Beta Tester Management
            </CardTitle>
            <Button
              onClick={fetchBetaTesters}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="field-rep">Field Reps</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Beta Testers Table */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signup Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBetaTesters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No beta testers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBetaTesters.map((betaTester) => (
                      <TableRow key={betaTester.id}>
                        <TableCell className="font-medium">
                          {betaTester.email}
                        </TableCell>
                        <TableCell>
                          {betaTester.name || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={betaTester.user_type === 'field-rep' ? 'default' : 'secondary'}>
                            {betaTester.user_type === 'field-rep' ? 'Field Rep' : 'Vendor'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={betaTester.nda_signed ? 'default' : 'secondary'}>
                            {betaTester.nda_signed ? 'NDA-Signed' : 'Pre-NDA'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(betaTester.signup_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => resendBetaEmail(betaTester)}
                              disabled={resendingEmails.has(betaTester.id)}
                              size="sm"
                              variant="outline"
                            >
                              {resendingEmails.has(betaTester.id) ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Mail className="h-3 w-3" />
                              )}
                              <span className="ml-1 hidden sm:inline">Resend Email</span>
                            </Button>
                            <Button
                              onClick={() => toggleActiveStatus(betaTester)}
                              size="sm"
                              variant={betaTester.is_active ? "secondary" : "default"}
                            >
                              {betaTester.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
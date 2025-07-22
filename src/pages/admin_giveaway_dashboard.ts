import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Gift,
  Plus,
  Calendar,
  Users,
  Trophy,
  Building,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Award
} from 'lucide-react';
import CreateGiveawayForm from '@/components/admin/CreateGiveawayForm';

interface MonthlyGiveaway {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  prize_value: number;
  start_date: string;
  end_date: string;
  entry_cost_rep_points: number;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  total_entries: number;
  sponsor_type: string;
  winner_id?: string;
  drawing_date?: string;
}

interface VendorGiveaway {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  prize_description: string;
  entry_cost_rep_points: number;
  start_date: string;
  end_date: string;
  max_entries_per_user: number;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  total_entries: number;
  network_size: number;
  winner_id?: string;
  vendor_name?: string;
}

const AdminGiveawayDashboard = () => {
  const { toast } = useToast();
  const [monthlyGiveaways, setMonthlyGiveaways] = useState<MonthlyGiveaway[]>([]);
  const [vendorGiveaways, setVendorGiveaways] = useState<VendorGiveaway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');

  // Fetch all giveaways
  const fetchGiveaways = async () => {
    try {
      setIsLoading(true);

      // Fetch monthly giveaways
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_giveaways')
        .select('*')
        .order('created_at', { ascending: false });

      if (monthlyError) throw monthlyError;

      // Fetch vendor giveaways with vendor names
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_network_giveaways')
        .select(`
          *,
          users!vendor_id (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (vendorError) throw vendorError;

      setMonthlyGiveaways(monthlyData || []);
      setVendorGiveaways(vendorData?.map(item => ({
        ...item,
        vendor_name: item.users?.display_name || 'Unknown Vendor'
      })) || []);

    } catch (error) {
      console.error('Error fetching giveaways:', error);
      toast({
        title: "Error",
        description: "Failed to load giveaways",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update giveaway status
  const updateGiveawayStatus = async (
    id: string, 
    newStatus: string, 
    type: 'monthly' | 'vendor'
  ) => {
    try {
      const table = type === 'monthly' ? 'monthly_giveaways' : 'vendor_network_giveaways';
      
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Giveaway ${newStatus === 'active' ? 'activated' : 'paused'}`,
      });

      fetchGiveaways();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update giveaway status",
        variant: "destructive"
      });
    }
  };

  // Delete giveaway
  const deleteGiveaway = async (id: string, type: 'monthly' | 'vendor') => {
    if (!confirm('Are you sure you want to delete this giveaway?')) return;

    try {
      const table = type === 'monthly' ? 'monthly_giveaways' : 'vendor_network_giveaways';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Giveaway Deleted",
        description: "The giveaway has been permanently removed",
      });

      fetchGiveaways();
    } catch (error) {
      console.error('Error deleting giveaway:', error);
      toast({
        title: "Error",
        description: "Failed to delete giveaway",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'ended': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const stats = {
    totalActive: [...monthlyGiveaways, ...vendorGiveaways].filter(g => g.status === 'active').length,
    totalEntries: [...monthlyGiveaways, ...vendorGiveaways].reduce((sum, g) => sum + g.total_entries, 0),
    monthlyActive: monthlyGiveaways.filter(g => g.status === 'active').length,
    vendorActive: vendorGiveaways.filter(g => g.status === 'active').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Giveaway Management</h1>
          <p className="text-muted-foreground">Create and manage platform giveaways</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Giveaway
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Giveaway</DialogTitle>
              <DialogDescription>
                Set up a new monthly or vendor network giveaway
              </DialogDescription>
            </DialogHeader>
            <CreateGiveawayForm 
              onSuccess={() => {
                setCreateDialogOpen(false);
                fetchGiveaways();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalActive}</p>
                <p className="text-sm text-muted-foreground">Active Giveaways</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.monthlyActive}</p>
                <p className="text-sm text-muted-foreground">Monthly Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.vendorActive}</p>
                <p className="text-sm text-muted-foreground">Vendor Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Giveaway Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Monthly Giveaways ({monthlyGiveaways.length})
          </TabsTrigger>
          <TabsTrigger value="vendor" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Vendor Giveaways ({vendorGiveaways.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly ClearMarket Giveaways</CardTitle>
              <CardDescription>
                Platform-wide monthly giveaways open to all active field reps
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading giveaways...</div>
              ) : monthlyGiveaways.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No monthly giveaways created yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Prize</TableHead>
                      <TableHead>Entry Cost</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyGiveaways.map((giveaway) => (
                      <TableRow key={giveaway.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{giveaway.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {giveaway.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{giveaway.prize_description}</p>
                            {giveaway.prize_value && (
                              <p className="text-sm text-muted-foreground">
                                ${giveaway.prize_value}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {giveaway.entry_cost_rep_points} RepPoints
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(giveaway.start_date)}</p>
                            <p className="text-muted-foreground">
                              to {formatDate(giveaway.end_date)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(giveaway.status)}>
                            {giveaway.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {giveaway.total_entries}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {giveaway.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGiveawayStatus(giveaway.id, 'active', 'monthly')}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {giveaway.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGiveawayStatus(giveaway.id, 'draft', 'monthly')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGiveaway(giveaway.id, 'monthly')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendor">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Network Giveaways</CardTitle>
              <CardDescription>
                Giveaways created by vendors for their specific networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading giveaways...</div>
              ) : vendorGiveaways.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vendor giveaways created yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Prize</TableHead>
                      <TableHead>Entry Cost</TableHead>
                      <TableHead>Network Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorGiveaways.map((giveaway) => (
                      <TableRow key={giveaway.id}>
                        <TableCell>
                          <Badge variant="outline">{giveaway.vendor_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{giveaway.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {giveaway.description?.substring(0, 40)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{giveaway.prize_description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {giveaway.entry_cost_rep_points} RepPoints
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {giveaway.network_size}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(giveaway.status)}>
                            {giveaway.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            {giveaway.total_entries}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {giveaway.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGiveawayStatus(giveaway.id, 'active', 'vendor')}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {giveaway.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateGiveawayStatus(giveaway.id, 'draft', 'vendor')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGiveaway(giveaway.id, 'vendor')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGiveawayDashboard;
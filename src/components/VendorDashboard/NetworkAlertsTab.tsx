import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Megaphone, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Archive, 
  AlertTriangle, 
  Trash2, 
  Copy,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface NetworkAlert {
  id: string;
  subject: string;
  message_body: string;
  created_at: string;
  sent_at: string | null;
  scheduled_send_date: string | null;
  status: string;
  total_recipients: number;
  filters_used: any;
  is_archived: boolean;
  is_outdated: boolean;
}

const NetworkAlertsTab = () => {
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_network_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load network alerts.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_network_alerts')
        .update({ is_archived: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_archived: true } : alert
      ));

      toast({
        title: 'Alert Archived',
        description: 'The alert has been archived successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to archive alert.',
        variant: 'destructive'
      });
    }
  };

  const handleMarkOutdated = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_network_alerts')
        .update({ is_outdated: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_outdated: true } : alert
      ));

      toast({
        title: 'Alert Marked as Outdated',
        description: 'The alert has been marked as outdated.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to mark alert as outdated.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vendor_network_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));

      toast({
        title: 'Alert Deleted',
        description: 'The alert has been deleted successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete alert.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (alert: NetworkAlert) => {
    if (alert.is_archived) return <Badge variant="secondary">Archived</Badge>;
    if (alert.is_outdated) return <Badge variant="outline">Outdated</Badge>;
    
    switch (alert.status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getFiltersDisplay = (filters: any) => {
    if (!filters) return 'No filters';
    
    const filterParts = [];
    if (filters.states?.length) filterParts.push(`States: ${filters.states.join(', ')}`);
    if (filters.systems?.length) filterParts.push(`Systems: ${filters.systems.join(', ')}`);
    if (filters.counties?.length) filterParts.push(`Counties: ${filters.counties.join(', ')}`);
    if (filters.orderTypes?.length) filterParts.push(`Order Types: ${filters.orderTypes.join(', ')}`);
    
    return filterParts.length ? filterParts.join(' | ') : 'No filters';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading network alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            My Network Alerts
          </CardTitle>
          <CardDescription>
            Manage alerts sent to your connected field reps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Network Alerts</h3>
              <p className="text-muted-foreground mb-4">
                You haven't sent any alerts to your network yet.
              </p>
              <Button>
                Send Your First Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedAlert(
                              expandedAlert === alert.id ? null : alert.id
                            )}
                            className="p-0 h-auto"
                          >
                            {expandedAlert === alert.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <h3 className="font-semibold text-foreground">{alert.subject}</h3>
                          {getStatusBadge(alert)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-7">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {alert.sent_at 
                              ? `Sent: ${format(new Date(alert.sent_at), 'PPP p')}`
                              : alert.scheduled_send_date
                              ? `Scheduled: ${format(new Date(alert.scheduled_send_date), 'PPP p')}`
                              : `Created: ${format(new Date(alert.created_at), 'PPP')}`
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {alert.total_recipients} recipients
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground ml-7">
                          Filters: {getFiltersDisplay(alert.filters_used)}
                        </div>

                        {expandedAlert === alert.id && (
                          <div className="ml-7 mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Message Content:</h4>
                            <p className="text-sm whitespace-pre-wrap">{alert.message_body}</p>
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleArchiveAlert(alert.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkOutdated(alert.id)}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Mark as Outdated
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate & Re-send
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkAlertsTab;
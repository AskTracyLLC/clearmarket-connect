import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Clock, CheckCircle, XCircle, Ban, ExternalLink } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConnectionRequest {
  id: string;
  recipient_id: string;
  recipient_email: string | null;
  recipient_username: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  personal_message: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  recipient_display_name?: string;
  recipient_anonymous_username?: string;
}

export const SentConnectionRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          id,
          recipient_id,
          recipient_email,
          recipient_username,
          status,
          personal_message,
          created_at,
          updated_at,
          expires_at
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch recipient display names
      if (data && data.length > 0) {
        const recipientIds = data.map(r => r.recipient_id).filter(Boolean);
        
        if (recipientIds.length > 0) {
          const { data: recipientData } = await supabase
            .from('users')
            .select('id, display_name, anonymous_username')
            .in('id', recipientIds);

          const recipientMap = new Map(
            recipientData?.map(u => [u.id, u]) || []
          );

          const enrichedData = data.map(request => ({
            ...request,
            status: request.status as ConnectionRequest['status'],
            recipient_display_name: recipientMap.get(request.recipient_id)?.display_name,
            recipient_anonymous_username: recipientMap.get(request.recipient_id)?.anonymous_username,
          })) as ConnectionRequest[];

          setRequests(enrichedData);
        } else {
          setRequests(data as ConnectionRequest[]);
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      toast({
        title: "Error",
        description: "Failed to load connection requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setCancellingId(requestId);
    
    try {
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('sender_id', user?.id); // Security: ensure user owns the request

      if (error) throw error;

      toast({
        title: "Request Cancelled",
        description: "Your connection request has been cancelled.",
      });

      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel connection request",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const isRequestExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (status: string, expiresAt?: string) => {
    // Check if request is expired
    if (status === 'pending' && expiresAt && isRequestExpired(expiresAt)) {
      return <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
        <Clock className="h-3 w-3 mr-1" />
        Expired
      </Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Declined
        </Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          <Ban className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter out expired requests from pending and move them to history
  const pendingRequests = requests.filter(r => 
    r.status === 'pending' && !isRequestExpired(r.expires_at)
  );
  const historyRequests = requests.filter(r => 
    r.status !== 'pending' || isRequestExpired(r.expires_at)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sent Connection Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Connection Requests</CardTitle>
          <CardDescription>
            Manage your sent connection requests to field representatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                History ({historyRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending connection requests</p>
                </div>
              ) : (
                pendingRequests.map((request) => {
                  const daysLeft = differenceInDays(new Date(request.expires_at), new Date());
                  const displayName = request.recipient_display_name || 
                                     request.recipient_anonymous_username || 
                                     request.recipient_username || 
                                     'Field Rep';
                  const isExpiringSoon = daysLeft <= 2 && daysLeft > 0;
                  
                  return (
                    <Card key={request.id} className={`border-l-4 ${isExpiringSoon ? 'border-l-orange-500' : 'border-l-amber-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground">{displayName}</h4>
                              {getStatusBadge(request.status, request.expires_at)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />
                              <span>Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                              <span>•</span>
                              <span className={isExpiringSoon ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                                Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {request.personal_message && (
                              <p className="text-sm text-muted-foreground italic mb-2">
                                "{request.personal_message}"
                              </p>
                            )}
                            <Link 
                              to={`/field-rep/profile/${request.recipient_id}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              target="_blank"
                            >
                              View field rep profile
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmCancelId(request.id)}
                            disabled={cancellingId === request.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {historyRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No request history</p>
                </div>
              ) : (
                historyRequests.map((request) => {
                  const displayName = request.recipient_display_name || 
                                     request.recipient_anonymous_username || 
                                     request.recipient_username || 
                                     'Field Rep';
                  const wasExpired = isRequestExpired(request.expires_at);
                  
                  return (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground">{displayName}</h4>
                              {getStatusBadge(wasExpired && request.status === 'pending' ? 'expired' : request.status, request.expires_at)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />
                              <span>Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                              <span>•</span>
                              <span>Updated {formatDistanceToNow(new Date(request.updated_at), { addSuffix: true })}</span>
                            </div>
                            {request.personal_message && (
                              <p className="text-sm text-muted-foreground italic mb-2">
                                "{request.personal_message}"
                              </p>
                            )}
                            <Link 
                              to={`/field-rep/profile/${request.recipient_id}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              target="_blank"
                            >
                              View field rep profile
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmCancelId} onOpenChange={(open) => !open && setConfirmCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Connection Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this connection request? This action cannot be undone, 
              and you'll need to send a new request if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCancelId && handleCancelRequest(confirmCancelId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, X, Check, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ConnectionRequest {
  id: string;
  sender_id: string;
  sender_email?: string;
  personal_message: string | null;
  expires_at: string;
  created_at: string;
  sender_display_name?: string;
  sender_anonymous_username?: string;
  sender_role?: string;
}

export const ConnectionRequestsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          id,
          sender_id,
          personal_message,
          expires_at,
          created_at
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch sender details for each request
      const requestsWithSenders = await Promise.all(
        (data || []).map(async (request) => {
          const { data: senderData } = await supabase
            .from('users')
            .select('display_name, anonymous_username, role, email')
            .eq('id', request.sender_id)
            .single();

          return {
            ...request,
            sender_display_name: senderData?.display_name,
            sender_anonymous_username: senderData?.anonymous_username,
            sender_role: senderData?.role,
            sender_email: senderData?.email,
          };
        })
      );

      setRequests(requestsWithSenders);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      toast({
        title: "Error loading requests",
        description: "Could not load connection requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Set up real-time subscription for new requests
    const channel = supabase
      .channel('connection-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_requests',
          filter: `recipient_id=eq.${user?.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      const { error } = await supabase
        .from('connection_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Get current user details for email
      if (user) {
        const { data: responderData } = await supabase
          .from('users')
          .select('anonymous_username, role')
          .eq('id', user.id)
          .single();

        // Send email notification to the sender
        if (request.sender_email && responderData) {
          try {
            await supabase.functions.invoke('send-connection-response-email', {
              body: {
                recipientEmail: request.sender_email,
                recipientUsername: request.sender_anonymous_username || 'User',
                responderUsername: responderData.anonymous_username || 'User',
                responderRole: responderData.role,
                status
              }
            });
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the response if email fails
          }
        }
      }

      toast({
        title: status === 'accepted' ? "Connection accepted!" : "Request declined",
        description: status === 'accepted' 
          ? "You've been added to their network. You can now message each other."
          : "The connection request has been declined.",
      });

      // Remove from list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error updating connection request:', error);
      toast({
        title: "Error",
        description: "Could not process the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading connection requests...</div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Network Invitations
          </CardTitle>
          <CardDescription>
            You have no pending connection requests
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Network Invitations
          <Badge variant="destructive" className="ml-2">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>
          Vendors want to connect with you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Before accepting any invitation, please confirm you know who the vendor is. 
            Review their profile details and avoid accepting blind invitations.
          </AlertDescription>
        </Alert>

        {requests.map((request) => {
          const displayName = request.sender_display_name || request.sender_anonymous_username || 'Unknown User';
          const isProcessing = processingId === request.id;
          const daysLeft = Math.ceil((new Date(request.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div key={request.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{displayName}</h4>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {request.sender_role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                  </div>
                  <Link 
                    to={`/vendor/profile/${request.sender_id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    target="_blank"
                  >
                    View vendor profile
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {request.personal_message && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-foreground italic">"{request.personal_message}"</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleResponse(request.id, 'accepted')}
                  disabled={isProcessing}
                  className="flex-1"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleResponse(request.id, 'rejected')}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

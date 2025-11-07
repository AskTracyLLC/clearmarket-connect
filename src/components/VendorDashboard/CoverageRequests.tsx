import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar, MapPin, Eye, Users, Edit, Pause, Play, Trash2, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PostCoverageRequestModal from './PostCoverageRequestModal';
import CoverageRequestDetailModal from './CoverageRequestDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CoverageRequests = () => {
  const [postRequestModalOpen, setPostRequestModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [coverageRequests, setCoverageRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleModalClose = (open: boolean) => {
    setPostRequestModalOpen(open);
    if (!open) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchCoverageRequests();
  }, [refreshTrigger]);

  const fetchCoverageRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view coverage requests",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('coverage_requests')
        .select('*')
        .eq('vendor_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCoverageRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching coverage requests:', error);
      toast({
        title: "Error",
        description: "Failed to load coverage requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditRequest = (requestId: string) => {
    console.log('Editing request:', requestId);
    toast({
      title: "Coming Soon",
      description: "Edit functionality will be available soon",
    });
  };

  const handlePauseResume = async (requestId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('coverage_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`,
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this coverage request?')) return;
    
    try {
      const { error } = await supabase
        .from('coverage_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coverage request deleted successfully",
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete coverage request",
        variant: "destructive",
      });
    }
  };

  const handleViewResponses = (request: any) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Posted Coverage Requests
              </CardTitle>
              <CardDescription>
                Manage your active and past coverage requests
              </CardDescription>
            </div>
            <Button onClick={() => setPostRequestModalOpen(true)}>
              <Megaphone className="h-4 w-4 mr-2" />
              Post New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {coverageRequests.map((request: any) => (
              <Card key={request.id} className="border border-muted">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-3">
                        <h3 className="font-semibold text-foreground text-lg">{request.title}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {request.selected_state} {request.selected_county && `- ${request.selected_county}`}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRequest(request.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Request
                        </DropdownMenuItem>
                        {request.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handlePauseResume(request.id, request.status)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Request
                          </DropdownMenuItem>
                        ) : request.status === 'paused' ? (
                          <DropdownMenuItem onClick={() => handlePauseResume(request.id, request.status)}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume Request
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{request.details}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {request.budget_range && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Budget:</span>
                          <div className="text-sm font-semibold text-foreground">{request.budget_range}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-muted">
                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Posted: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewResponses(request)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        View Responses
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
          
          {!loading && coverageRequests.length === 0 && (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Coverage Requests</h3>
              <p className="text-muted-foreground mb-4">
                Post your first coverage request to find Field Reps in areas you need.
              </p>
              <Button onClick={() => setPostRequestModalOpen(true)}>
                <Megaphone className="h-4 w-4 mr-2" />
                Post Coverage Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <PostCoverageRequestModal 
        open={postRequestModalOpen}
        onOpenChange={handleModalClose}
      />
      
      <CoverageRequestDetailModal 
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        request={selectedRequest}
      />
    </div>
  );
};

export default CoverageRequests;
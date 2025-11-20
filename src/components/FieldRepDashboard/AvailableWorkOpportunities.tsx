import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Eye,
  Calendar,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CoverageRequest {
  id: string;
  title: string;
  description: string;
  selected_state: string;
  selected_counties: string[];
  budget_range: string;
  estimated_monthly_volume: string;
  selected_platforms: string[];
  selected_inspection_types: string[];
  created_at: string;
  expires_at: string;
  view_count: number;
  response_count: number;
  vendor_user_id: string;
  vendor_profile?: {
    company_name: string;
    anonymous_username: string;
  };
}

export const AvailableWorkOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CoverageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CoverageRequest | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAvailableRequests();
    }
  }, [user]);

  const fetchAvailableRequests = async () => {
    try {
      setLoading(true);

      // First, get field rep's coverage areas
      const { data: coverageAreas, error: coverageError } = await supabase
        .from('coverage_areas')
        .select('state_code, counties')
        .eq('user_id', user?.id);

      if (coverageError) throw coverageError;

      if (!coverageAreas || coverageAreas.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get all coverage requests that match field rep's coverage
      const { data: coverageRequests, error: requestsError } = await supabase
        .from('coverage_requests')
        .select('*')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get vendor information from users and vendor_profile tables
      const vendorIds = [...new Set(coverageRequests?.map(r => r.vendor_user_id).filter(Boolean) || [])];
      
      let vendorProfiles: Record<string, any> = {};
      if (vendorIds.length > 0) {
        const { data: vendors } = await supabase
          .from('users')
          .select('id, display_name, anonymous_username')
          .in('id', vendorIds);
        
        if (vendors) {
          vendorProfiles = Object.fromEntries(
            vendors.map(v => [v.id, { company_name: v.display_name, anonymous_username: v.anonymous_username }])
          );
        }
      }

      // Filter requests that match field rep's coverage areas
      const matchingRequests = (coverageRequests || []).filter((request: any) => {
        return coverageAreas.some(area => {
          if (area.state_code !== request.selected_state) return false;
          
          // If request doesn't specify counties, it matches the whole state
          if (!request.selected_counties || request.selected_counties.length === 0) {
            return true;
          }
          
          // Check if any of the request's counties match the field rep's counties
          return request.selected_counties.some((county: string) => 
            area.counties.includes(county)
          );
        });
      });

      setRequests(matchingRequests.map((req: any) => ({
        ...req,
        vendor_profile: vendorProfiles[req.vendor_user_id]
      })));

    } catch (error) {
      console.error('Error fetching available work:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available work opportunities"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (request: CoverageRequest) => {
    // Track view
    try {
      await supabase
        .from('coverage_request_views')
        .insert({
          request_id: request.id,
          viewer_id: user?.id
        });

      // Increment view count
      await supabase
        .from('coverage_requests')
        .update({ view_count: request.view_count + 1 })
        .eq('id', request.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }

    setSelectedRequest(request);
  };

  const handleInterested = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('coverage_request_responses')
        .insert({
          request_id: requestId,
          field_rep_id: user?.id,
          status: 'interested'
        });

      if (error) throw error;

      toast({
        title: "Interest Registered",
        description: "The vendor will be notified of your interest!"
      });

      // Refresh the list
      fetchAvailableRequests();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to register interest"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Available Work Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Available Work Opportunities
        </CardTitle>
        <CardDescription>
          Coverage requests from vendors in your service areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-muted-foreground font-medium mb-2">
                No work opportunities available yet
              </p>
              <p className="text-sm text-muted-foreground">
                Vendors posting coverage requests in your areas will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Posted by {request.vendor_profile?.company_name || request.vendor_profile?.anonymous_username}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {request.selected_state}
                  </Badge>
                </div>

                <p className="text-sm mb-4 line-clamp-2">{request.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {request.selected_counties?.length > 0 
                        ? `${request.selected_counties.length} counties`
                        : 'Statewide'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{request.budget_range}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{request.estimated_monthly_volume}/mo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {request.selected_platforms && request.selected_platforms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.selected_platforms.map((platform, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewRequest(request)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInterested(request.id)}
                  >
                    I'm Interested
                  </Button>
                  <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {request.view_count}
                    </span>
                    <span>{request.response_count} responses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

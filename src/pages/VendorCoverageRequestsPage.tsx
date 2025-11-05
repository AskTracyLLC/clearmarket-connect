import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Briefcase, Users, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CoverageRequest {
  id: string;
  title: string;
  description: string;
  selected_state: string;
  selected_counties: string[];
  selected_cities: string[];
  selected_inspection_types: string[];
  selected_platforms: string[];
  budget_range: string;
  estimated_monthly_volume: string;
  years_experience_required: string | null;
  abc_required: boolean | null;
  hud_key_required: boolean | null;
  status: string;
  created_at: string;
  expires_at: string;
}

const VendorCoverageRequestsPage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CoverageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch vendor name
        const { data: userData } = await supabase
          .from('users')
          .select('anonymous_username, display_name')
          .eq('id', vendorId)
          .single();

        if (userData) {
          setVendorName(userData.anonymous_username || userData.display_name);
        }

        // Fetch active coverage requests
        const { data, error } = await supabase
          .from('coverage_requests')
          .select('*')
          .eq('vendor_id', vendorId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching coverage requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load coverage requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchData();
    }
  }, [vendorId]);

  const handleExpressInterest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to express interest in this coverage request',
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('coverage_request_responses')
        .insert({
          request_id: requestId,
          field_rep_id: user.id,
          status: 'interested',
        });

      if (error) throw error;

      toast({
        title: 'Interest Sent!',
        description: 'The vendor will be notified of your interest',
      });
    } catch (error: any) {
      console.error('Error expressing interest:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to express interest',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/vendor/public/${vendorId}`} className="hover:text-primary">{vendorName}</Link>
          <span>/</span>
          <span className="text-foreground">Coverage Requests</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => navigate(`/vendor/public/${vendorId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Active Coverage Requests</h1>
          <p className="text-muted-foreground">
            {vendorName} is looking for field representatives in the following areas
          </p>
        </div>

        {/* Coverage Requests List */}
        {requests.length === 0 ? (
          <Alert>
            <AlertDescription>
              This vendor currently has no active coverage requests.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                      <p className="text-muted-foreground">{request.description}</p>
                    </div>
                    <Badge variant={request.status === 'active' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{request.selected_state}</div>
                      {request.selected_counties.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Counties: {request.selected_counties.join(', ')}
                        </div>
                      )}
                      {request.selected_cities.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Cities: {request.selected_cities.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Work Types */}
                  {request.selected_inspection_types.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex flex-wrap gap-2">
                        {request.selected_inspection_types.map((type, idx) => (
                          <Badge key={idx} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget & Volume */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Budget Range</div>
                        <div className="font-medium">{request.budget_range}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Est. Monthly Volume</div>
                        <div className="font-medium">{request.estimated_monthly_volume}</div>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {(request.abc_required || request.hud_key_required || request.years_experience_required) && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">Requirements:</div>
                      <div className="flex flex-wrap gap-2">
                        {request.abc_required && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            ABC Required
                          </Badge>
                        )}
                        {request.hud_key_required && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            HUD Key Required
                          </Badge>
                        )}
                        {request.years_experience_required && (
                          <Badge variant="secondary">
                            {request.years_experience_required} Experience
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  {request.selected_platforms.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">Platforms Used:</div>
                      <div className="flex flex-wrap gap-2">
                        {request.selected_platforms.map((platform, idx) => (
                          <Badge key={idx} variant="outline">{platform}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posted Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                    <Calendar className="h-4 w-4" />
                    Posted {new Date(request.created_at).toLocaleDateString()}
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleExpressInterest(request.id)}
                    className="w-full md:w-auto"
                  >
                    Express Interest
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VendorCoverageRequestsPage;

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Share2, Check, MapPin, Briefcase, Monitor, Award, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { usePublicFieldRepProfile } from '@/hooks/usePublicFieldRepProfile';
import { useAuth } from '@/contexts/AuthContext';

const FieldRepPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  
  const { profile: fieldRep, loading, error } = usePublicFieldRepProfile(id);

  const getInitials = () => {
    if (fieldRep?.firstName && fieldRep?.lastName) {
      return `${fieldRep.firstName[0]}${fieldRep.lastName[0]}`.toUpperCase();
    }
    return fieldRep?.anonymousUsername?.substring(0, 2).toUpperCase() || 'FR';
  };

  const getDisplayName = () => {
    if (fieldRep?.displayName) return fieldRep.displayName;
    if (fieldRep?.firstName && fieldRep?.lastName) {
      return `${fieldRep.firstName} ${fieldRep.lastName}`;
    }
    return fieldRep?.anonymousUsername || 'Field Rep';
  };

  const getLocation = () => {
    const parts = [];
    if (fieldRep?.city) parts.push(fieldRep.city);
    if (fieldRep?.state) parts.push(fieldRep.state);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const profileUrl = `${window.location.origin}/fieldrep/public/${id}`;
  const shareText = fieldRep 
    ? `Connect with ${fieldRep.anonymousUsername} on ClearMarket - Trusted field representative with ${Math.round(fieldRep.trustScore || 50)}% trust score`
    : 'Check out this field representative on ClearMarket';

  const handleMessage = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send messages.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    navigate(`/messages?recipient=${id}`);
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    const shareData = {
      title: `${fieldRep.anonymousUsername} - Field Representative`,
      text: shareText,
      url: profileUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${profileUrl}`);
        toast({
          title: "Link copied!",
          description: "Profile link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Unable to share profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !fieldRep) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Profile not found. This user may not exist or may not be a field representative."}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/fieldrep/search')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/fieldrep/search" className="hover:text-primary">Field Reps</Link>
          <span>/</span>
          <span className="text-foreground">{fieldRep.anonymousUsername}</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 mb-4 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{getDisplayName()}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocation()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {fieldRep.bio && (
                  <div className="mb-4">
                    <p className="text-muted-foreground leading-relaxed">{fieldRep.bio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleMessage} className="flex-1 sm:flex-none">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message This Rep
                  </Button>
                  <Button variant="outline" onClick={handleShare} disabled={isSharing}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {isSharing ? 'Sharing...' : 'Share Profile'}
                  </Button>
                </div>
              </div>

              {/* Trust Score */}
              <div className="flex justify-center md:justify-end">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Trust Score</div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {Math.round(fieldRep.trustScore || 50)}%
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {fieldRep.totalReviews} {fieldRep.totalReviews === 1 ? 'review' : 'reviews'}
                    </div>
                    <Link to="/trust-score-info" className="text-xs text-primary hover:underline">
                      What's this?
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {fieldRep.hasAspenGrove && fieldRep.aspenGroveId && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    AspenGrove ID
                    {fieldRep.aspenGroveExpiration && (
                      <span className="text-xs ml-1">
                        (exp: {new Date(fieldRep.aspenGroveExpiration).toLocaleDateString()})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {fieldRep.hasHudKeys && fieldRep.hudKeys && fieldRep.hudKeys.length > 0 && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    HUD Keys ({fieldRep.hudKeys.length})
                  </span>
                </div>
              )}
              {!fieldRep.hasAspenGrove && !fieldRep.hasHudKeys && (
                <p className="text-sm text-muted-foreground">No verifications added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Coverage Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Coverage Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldRep.coverageAreas.length > 0 ? (
                (() => {
                  // Group coverage areas by state
                  const grouped = fieldRep.coverageAreas.reduce((acc, area) => {
                    if (!acc[area.state]) {
                      acc[area.state] = { isAllCounties: false, counties: [] };
                    }
                    if (area.isAllCounties) {
                      acc[area.state].isAllCounties = true;
                    } else {
                      acc[area.state].counties = [...new Set([...acc[area.state].counties, ...area.counties])];
                    }
                    return acc;
                  }, {} as Record<string, { isAllCounties: boolean; counties: string[] }>);

                  return Object.entries(grouped)
                    .sort(([stateA], [stateB]) => stateA.localeCompare(stateB))
                    .map(([state, data]) => (
                      <div key={state}>
                        <div className="font-medium">{state}</div>
                        <div className="text-sm text-muted-foreground ml-4">
                          {data.isAllCounties ? 'All counties' : data.counties.sort().join(', ')}
                        </div>
                      </div>
                    ));
                })()
              ) : (
                <p className="text-sm text-muted-foreground">No coverage areas specified</p>
              )}
            </CardContent>
          </Card>

          {/* Work Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Type of Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {fieldRep.inspectionTypes && fieldRep.inspectionTypes.length > 0 ? (
                  fieldRep.inspectionTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
                      {type}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No work types specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platforms Used */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Platforms Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fieldRep.platforms && fieldRep.platforms.length > 0 ? (
                fieldRep.platforms.map((platform, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {platform}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No platforms specified</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{fieldRep.totalReviews}</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(fieldRep.trustScore || 50)}%
                </div>
                <div className="text-sm text-muted-foreground">Trust Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {new Date().getFullYear() - fieldRep.createdAt.getFullYear()}+ years
                </div>
                <div className="text-sm text-muted-foreground">On ClearMarket</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ClearMarket Promotion */}
        <div className="text-center mt-8 p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Find quality field representatives on{' '}
            <Link to="/" className="text-primary hover:underline font-medium">
              ClearMarket
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FieldRepPublicProfile;
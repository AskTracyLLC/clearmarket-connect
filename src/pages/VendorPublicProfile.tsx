import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Share2, Check, MapPin, Briefcase, Monitor, Award, Building, Layers, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { usePublicVendorProfile } from '@/hooks/usePublicVendorProfile';

const VendorPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);

  const { profile, loading, error } = usePublicVendorProfile(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading vendor profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error || "Vendor profile not found. This vendor may not exist or may have been removed."}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/vendor/search')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendor Search
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const shareId = id && !id.startsWith(':') ? id : profile.userId;
  const profileUrl = `${window.location.origin}/vendor/public/${shareId}`;
  const trustScoreValue = profile.trustScore?.overall_score || 0;
  const shareText = `Connect with ${profile.anonymousUsername} on ClearMarket${trustScoreValue > 0 ? ` - Trusted vendor with ${Math.round(trustScoreValue)}% trust score` : ''}`;

  const handleMessage = () => {
    // Navigate to messages with this vendor pre-selected
    window.location.href = `/messages?recipient=${id}`;
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    const shareData = {
      title: `${profile.anonymousUsername} - Vendor`,
      text: shareText,
      url: profileUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/vendor/search" className="hover:text-primary">Vendors</Link>
          <span>/</span>
          <span className="text-foreground">{profile.anonymousUsername}</span>
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
                    {profile.companyAbbreviation ? profile.companyAbbreviation.slice(0, 3).toUpperCase() : getInitials(profile.displayName || profile.anonymousUsername)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{profile.companyName || profile.anonymousUsername}</h1>
                  {profile.companyName && (
                    <p className="text-sm text-muted-foreground mb-2">{profile.anonymousUsername}</p>
                  )}
                </div>
              </div>

              <div className="flex-1">
                {profile.companyBio && (
                  <div className="mb-4">
                    <p className="text-muted-foreground leading-relaxed">{profile.companyBio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => navigate(`/vendor/${id}/coverage-requests`)} className="flex-1 sm:flex-none">
                    <Layers className="h-4 w-4 mr-2" />
                    View Coverage Requests
                  </Button>
                  <Button variant="outline" onClick={handleMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" onClick={handleShare} disabled={isSharing}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {isSharing ? 'Sharing...' : 'Share'}
                  </Button>
                </div>
              </div>

              {/* Trust Score */}
              <div className="flex justify-center md:justify-end">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Trust Score</div>
                    {profile.trustScore && profile.trustScore.overall_score > 0 ? (
                      <>
                        <div className="text-4xl font-bold text-primary mb-1">
                          {Math.round(profile.trustScore.overall_score)}
                        </div>
                        <Badge variant="secondary" className="mb-2">
                          {profile.trustScore.badge_level}
                        </Badge>
                      </>
                    ) : (
                      <div className="text-lg font-medium text-muted-foreground mb-2">Not Yet Rated</div>
                    )}
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
        {profile.verifications && (profile.verifications.emailVerified || profile.verifications.phoneVerified) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {profile.verifications.emailVerified && (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200 font-medium">Email Verified</span>
                  </div>
                )}
                {profile.verifications.phoneVerified && (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200 font-medium">Phone Verified</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Coverage Areas */}
          {profile.coverageAreas && profile.coverageAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Coverage Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.coverageAreas
                  .sort((a, b) => a.state.localeCompare(b.state))
                  .map((area, index) => (
                    <div key={index}>
                      <div className="font-medium">{area.state}</div>
                      <div className="text-sm text-muted-foreground ml-4">
                        {area.isAllCounties ? 'All Counties' : area.counties.sort().join(', ')}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Work Types */}
          {profile.workTypes && profile.workTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.workTypes.map((workType, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
                      {workType}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Platforms Used */}
        {profile.platforms && profile.platforms.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Platforms Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.platforms.map((platform, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {platform}
                  </Badge>
                ))}
                {profile.otherPlatform && (
                  <Badge variant="outline" className="px-3 py-1">
                    {profile.otherPlatform}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {profile.trustScore?.total_reviews || 0}
                </div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
              {profile.avgJobsPerMonth && (
                <div>
                  <div className="text-2xl font-bold text-primary">{profile.avgJobsPerMonth}</div>
                  <div className="text-sm text-muted-foreground">Avg Jobs/Month</div>
                </div>
              )}
              {profile.joinedDate && (
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {new Date().getFullYear() - new Date(profile.joinedDate).getFullYear()}+ years
                  </div>
                  <div className="text-sm text-muted-foreground">On Platform</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ClearMarket Promotion */}
        <div className="text-center mt-8 p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Find quality vendors on{' '}
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

export default VendorPublicProfile;
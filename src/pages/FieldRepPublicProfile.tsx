import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Share2, Check, MapPin, Briefcase, Monitor, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

// Mock data - replace with real data integration
const mockFieldRepData = {
  id: 'fieldrep-123',
  displayName: 'John Doe',
  anonymousUsername: 'FieldRep#2',
  initials: 'J.D.',
  location: 'Atlanta, GA',
  bio: 'Experienced field representative with 5+ years in property inspections. Specializing in residential and commercial properties across the Southeast.',
  trustScore: 85,
  profilePicture: null,
  verifications: {
    aspenGroveId: true,
    hudKeys: true,
    backgroundCheck: true
  },
  coverage: [
    { state: 'Georgia', counties: ['Fulton', 'DeKalb', 'Gwinnett', 'Cobb'] },
    { state: 'Alabama', counties: ['Jefferson', 'Mobile'] },
    { state: 'Tennessee', counties: ['Davidson', 'Knox'] }
  ],
  workTypes: [
    'Interior/Exterior Inspections',
    'Occupancy Checks', 
    'Marketing Photos',
    'Property Condition Reports',
    'REO Inspections'
  ],
  platforms: ['Clear Capital', 'ServiceLink', 'Altisource', 'Safeguard Properties'],
  joinDate: '2019-03-15',
  completedJobs: 1247,
  averageRating: 4.8
};

const FieldRepPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSharing, setIsSharing] = useState(false);

  const fieldRep = mockFieldRepData; // Replace with actual data fetch based on id

  const profileUrl = `${window.location.origin}/fieldrep/profile/${id}`;
  const shareText = `Connect with ${fieldRep.displayName} on ClearMarket - Trusted field representative with ${fieldRep.trustScore}% trust score`;

  const handleMessage = () => {
    // Navigate to messages with this rep pre-selected
    window.location.href = `/messages?recipient=${id}`;
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    const shareData = {
      title: `${fieldRep.displayName} - Field Representative`,
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
          <span className="text-foreground">{fieldRep.displayName}</span>
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
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={fieldRep.profilePicture} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {fieldRep.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{fieldRep.displayName}</h1>
                  <p className="text-primary text-sm mb-2">({fieldRep.anonymousUsername})</p>
                  <div className="flex items-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{fieldRep.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <p className="text-muted-foreground leading-relaxed">{fieldRep.bio}</p>
                </div>

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
                    <div className="text-3xl font-bold text-primary mb-1">{fieldRep.trustScore}</div>
                    <div className="text-sm text-muted-foreground">Trust Score</div>
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
              {fieldRep.verifications.aspenGroveId && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>AspenGrove ID</span>
                </div>
              )}
              {fieldRep.verifications.hudKeys && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>HUD Keys</span>
                </div>
              )}
              {fieldRep.verifications.backgroundCheck && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Background Check</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">If Applicable</p>
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
              {fieldRep.coverage.map((area, index) => (
                <div key={index}>
                  <div className="font-medium">{area.state}</div>
                  <div className="text-sm text-muted-foreground ml-4">
                    {area.counties.join(', ')}
                  </div>
                </div>
              ))}
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
              <div className="space-y-2">
                {fieldRep.workTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platforms Used */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Platforms Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {fieldRep.platforms.map((platform, index) => (
                  <Badge key={index} variant="outline">
                    {platform}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{fieldRep.completedJobs.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Completed Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{fieldRep.averageRating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {new Date().getFullYear() - new Date(fieldRep.joinDate).getFullYear()}+ years
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
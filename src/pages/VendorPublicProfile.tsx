import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Share2, Check, MapPin, Briefcase, Monitor, Award, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

// Mock data - replace with real data integration
const mockVendorData = {
  id: 'vendor-123',
  companyName: 'Premier Property Services LLC',
  anonymousUsername: 'Vendor#5',
  initials: 'PPS',
  location: 'Dallas, TX',
  bio: 'Leading property preservation and inspection company serving the Southwest region for over 12 years. We specialize in high-volume residential and commercial property services with a focus on quality, efficiency, and reliable field rep partnerships. Our experienced team ensures quick turnaround times and comprehensive reporting for all inspection needs.',
  trustScore: 92,
  companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  verifications: {
    businessLicense: true,
    insuranceCertificate: true,
    bondedStatus: true
  },
  serviceAreas: [
    { state: 'Texas', counties: ['Dallas', 'Tarrant', 'Collin', 'Denton', 'Rockwall'] },
    { state: 'Oklahoma', counties: ['Oklahoma', 'Tulsa', 'Cleveland'] },
    { state: 'Arkansas', counties: ['Pulaski', 'Washington', 'Benton'] }
  ],
  servicesOffered: [
    'Property Inspections',
    'Occupancy Verifications',
    'Property Preservation',
    'REO Services',
    'Insurance Claims',
    'Marketing Photos',
    'Maintenance Coordination'
  ],
  platforms: ['Clear Capital', 'ServiceLink', 'Altisource', 'Safeguard Properties', 'PEMCO', 'Five Brothers', 'Mortgage Contracting Services'],
  establishedDate: '2012-01-15',
  totalReviews: 89,
  averageRating: 4.7
};

const VendorPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSharing, setIsSharing] = useState(false);

  const vendor = mockVendorData; // Replace with actual data fetch based on id

  const profileUrl = `${window.location.origin}/vendor/public/${id}`;
  const shareText = `Connect with ${vendor.anonymousUsername} on ClearMarket - Trusted vendor with ${vendor.trustScore}% trust score`;

  const handleMessage = () => {
    // Navigate to messages with this vendor pre-selected
    window.location.href = `/messages?recipient=${id}`;
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    const shareData = {
      title: `${vendor.anonymousUsername} - Vendor`,
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
          <Link to="/vendor/search" className="hover:text-primary">Vendors</Link>
          <span>/</span>
          <span className="text-foreground">{vendor.anonymousUsername}</span>
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
                  <AvatarImage src={vendor.companyLogo} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {vendor.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{vendor.anonymousUsername}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{vendor.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <p className="text-muted-foreground leading-relaxed">{vendor.bio}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleMessage} className="flex-1 sm:flex-none">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message This Vendor
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
                    <div className="text-lg font-medium text-muted-foreground mb-2">Coming Soon</div>
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
              Business Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {vendor.verifications.businessLicense && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">Business License</span>
                </div>
              )}
              {vendor.verifications.insuranceCertificate && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">Insurance Certificate</span>
                </div>
              )}
              {vendor.verifications.bondedStatus && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">Bonded</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.serviceAreas.map((area, index) => (
                <div key={index}>
                  <div className="font-medium">{area.state}</div>
                  <div className="text-sm text-muted-foreground ml-4">
                    {area.counties.join(', ')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendor.servicesOffered.map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
                    {service}
                  </Badge>
                ))}
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
              {vendor.platforms.map((platform, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {platform}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{vendor.totalReviews}</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{vendor.averageRating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {new Date().getFullYear() - new Date(vendor.establishedDate).getFullYear()}+ years
                </div>
                <div className="text-sm text-muted-foreground">In Business</div>
              </div>
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
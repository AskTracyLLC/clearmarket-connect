import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Index Page Component - Main Landing Page
 * Direct signup flow for all users
 */
const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    // Handle email verification
    if (token && type === 'signup') {
      navigate('/auth/verify', { replace: true });
      return;
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-primary">ClearMarket</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The professional network connecting field representatives with vendors in the property inspection industry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-semibold mb-2">Get Started</h3>
                <p className="text-muted-foreground mb-4">Create your account and join the network</p>
                <button 
                  onClick={() => navigate('/auth?tab=signup')}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                  Sign Up Now
                </button>
              </Card>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Find Work</h3>
              <p className="text-muted-foreground">Connect with vendors seeking field representatives in your area</p>
            </Card>
            
            <Card className="p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Build Trust</h3>
              <p className="text-muted-foreground">Establish your reputation through verified reviews and ratings</p>
            </Card>
            
            <Card className="p-6">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Grow Network</h3>
              <p className="text-muted-foreground">Expand your professional connections nationwide</p>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <p className="text-muted-foreground mb-4">Already have an account?</p>
            <Link 
              to="/auth"
              className="text-primary hover:underline font-medium inline-block"
              onClick={() => console.log('➡️ Navigating to /auth from home CTA')}
            >
              Sign In
            </Link>
          </div>

          {/* How ClearMarket Works Section */}
          <div className="bg-card/50 rounded-lg p-8 md:p-12 border border-border">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <span className="text-4xl">🔧</span>
                How ClearMarket Works
              </h2>
              <p className="text-xl text-accent font-semibold mb-4">
                Smarter Connections. Stronger Reputation. More Work.
              </p>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                ClearMarket helps independent Field Reps and Property Inspection Vendors connect with confidence — with transparency, trust, and performance at the core.
              </p>
            </div>

            {/* For Field Reps */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">👤</span>
                  For Field Reps
                </h3>
                <p className="text-accent font-medium">Looking for Work?</p>
              </div>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                ClearMarket lets you showcase your experience, service area, and specialties — making it easier for the right vendors to find you.
              </p>
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4 text-accent">👥</div>
                  <h4 className="font-semibold mb-2">Create a profile (free)</h4>
                  <p className="text-sm text-muted-foreground">
                    List your service areas, inspection types, platforms used, and pricing.
                  </p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4 text-primary">🔍</div>
                  <h4 className="font-semibold mb-2">Be seen by vendors</h4>
                  <p className="text-sm text-muted-foreground">
                    Vendors actively seeking coverage can find you through location-based searches.
                  </p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4" style={{ color: 'hsl(var(--accent))' }}>💬</div>
                  <h4 className="font-semibold mb-2">Message your network</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect directly with vendors in your network through our messaging system.
                  </p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4" style={{ color: 'hsl(var(--accent))' }}>⭐</div>
                  <h4 className="font-semibold mb-2">Build your reputation</h4>
                  <p className="text-sm text-muted-foreground">
                    Build your visibility and reputation with verified feedback from real work.
                  </p>
                </Card>
              </div>
            </div>

            {/* For Vendors */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">💼</span>
                  For Vendors
                </h3>
                <p className="text-accent font-medium">Need Reliable Coverage?</p>
              </div>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find Field Reps by location, service type, and platform experience — with built-in trust signals that help you choose wisely.
              </p>
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4 text-primary">📍</div>
                  <h4 className="font-semibold mb-2">Location-based search</h4>
                  <p className="text-sm text-muted-foreground">
                    Search for reps in your target area by zip code, county, or state coverage.
                  </p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4 text-accent">🔍</div>
                  <h4 className="font-semibold mb-2">Filter by requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Filter by inspection types, platform experience, and specific qualifications.
                  </p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4" style={{ color: 'hsl(var(--accent))' }}>🔓</div>
                  <h4 className="font-semibold mb-2">Unlock contact details</h4>
                  <p className="text-sm text-muted-foreground">
                    Use credits to unlock contact details and connect directly with qualified reps.
                  </p>
                </Card>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4 text-primary">⭐</div>
                  <h4 className="font-semibold mb-2">Monitor performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Share feedback and monitor rep performance to build lasting partnerships.
                  </p>
                </Card>
              </div>
            </div>

            {/* Trust Matters */}
            <div className="bg-muted/30 rounded-lg p-8 border border-border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">✅</span>
                  Trust Matters
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                  What sets ClearMarket apart is our focus on verified, reputation-based connections. Rather than letting anyone rate anyone, only confirmed connections can leave feedback — keeping things fair and credible.
                </p>
                <p className="font-semibold mb-6">
                  Users can earn "Trusted" status by consistently demonstrating:
                </p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3 text-accent">🎯</div>
                  <p className="font-medium">Professionalism</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3 text-primary">⭐</div>
                  <p className="font-medium">Reliability</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3 text-accent">💬</div>
                  <p className="font-medium">Positive verified reviews</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3 text-primary">👥</div>
                  <p className="font-medium">Community engagement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

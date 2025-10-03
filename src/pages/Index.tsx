import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Already have an account?</p>
            <button 
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

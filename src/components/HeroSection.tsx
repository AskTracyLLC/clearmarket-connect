import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Search, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Connect with Trusted
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              Property Inspection Professionals
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ClearMarket bridges the gap between Field Reps seeking work and Vendors seeking coverage.
            Build trust through transparency, efficiency, and verified feedback.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" className="min-w-[200px]">
              I'm Looking for Work
              <span className="text-xs opacity-80 ml-2">(Field Reps)</span>
            </Button>
            <Button variant="outline-primary" size="xl" className="min-w-[200px]">
              I'm Seeking Coverage
              <span className="text-xs opacity-80 ml-2">(Vendors)</span>
            </Button>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Verified Professionals</h3>
            <p className="text-muted-foreground text-sm">
              Connect with background-checked Field Reps and established Vendors in your area.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Smart Matching</h3>
            <p className="text-muted-foreground text-sm">
              Find the perfect match by location, inspection type, and platform expertise.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-trust" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Trust & Transparency</h3>
            <p className="text-muted-foreground text-sm">
              Build confidence with verified reviews, trust scores, and transparent feedback.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Grow Your Business</h3>
            <p className="text-muted-foreground text-sm">
              Expand your network and grow your inspection business with quality connections.
            </p>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-muted-foreground mb-4">Funding the future of property inspection with ClearVue AI</p>
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <span>🔒 Secure Platform</span>
            <span>📊 Transparent Pricing</span>
            <span>⭐ Verified Reviews</span>
            <span>🚀 Future-Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlatformGrowthStats } from "@/components/ui/stats-bar";
import { Users, Search, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleFieldRepClick = () => {
    navigate('/fieldrep/search');
  };

  const handleVendorClick = () => {
    navigate('/vendor/search');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Welcome to ClearMarket
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            The professional network where field reps find better vendors and vendors find reliable reps in the property inspection industry.
          </p>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Get Started</h2>
            <p className="text-muted-foreground mb-4">Create your account and join the network.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button 
              variant="hero" 
              size="xl" 
              className="min-w-[200px]"
              onClick={handleFieldRepClick}
            >
              I'm a Field Rep
            </Button>
            <Button 
              variant="outline-primary" 
              size="xl" 
              className="min-w-[200px]"
              onClick={handleVendorClick}
            >
              I'm a Vendor
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Free to join. No dispatching. You stay independent.
          </p>
          
          <p className="text-muted-foreground">
            Already have an account? <a href="/auth" className="text-primary hover:underline">Sign In</a>
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Find Work</h3>
            <p className="text-muted-foreground text-sm">
              Connect with vendors seeking field reps in your coverage areas. Search by location, systems used, and inspection type.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Build Trust</h3>
            <p className="text-muted-foreground text-sm">
              Earn a reputation based on verified work, not popularity contests. Reviews and scores come from confirmed vendor–rep connections.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-trust" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Grow Network</h3>
            <p className="text-muted-foreground text-sm">
              Build a professional network of vendors and reps nationwide while staying in control of who you work with.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Verified Professionals</h3>
            <p className="text-muted-foreground text-sm">
              Connect with vetted field reps and vendors who have proven track records in the industry.
            </p>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-border">
          <PlatformGrowthStats />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
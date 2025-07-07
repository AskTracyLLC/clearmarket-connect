import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, MessageSquare, Star } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How ClearMarket Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent, and efficient. Connect with the right professionals in minutes.
          </p>
        </div>

        {/* For Field Reps */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-12">
            For Field Reps <span className="text-primary">(Looking for Work)</span>
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">1. Create Profile</h4>
              <p className="text-muted-foreground text-sm">
                List your service areas, inspection types, platforms used, and pricing.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">2. Get Discovered</h4>
              <p className="text-muted-foreground text-sm">
                Vendors find you through location-based searches and expertise matching.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-trust" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">3. Connect & Work</h4>
              <p className="text-muted-foreground text-sm">
                Vendors unlock your contact info and reach out for inspection opportunities.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">4. Build Trust</h4>
              <p className="text-muted-foreground text-sm">
                Earn reviews and build your Trust Score for more opportunities.
              </p>
            </Card>
          </div>
        </div>

        {/* For Vendors */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-foreground mb-12">
            For Vendors <span className="text-accent">(Seeking Coverage)</span>
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">1. Set Up Profile</h4>
              <p className="text-muted-foreground text-sm">
                Define your coverage areas and inspection types you need support with.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">2. Search & Filter</h4>
              <p className="text-muted-foreground text-sm">
                Find Field Reps by zip code, inspection type, and platform familiarity.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-trust" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">3. Unlock & Connect</h4>
              <p className="text-muted-foreground text-sm">
                Use credits or payment to unlock contact information and reach out.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">4. Leave Feedback</h4>
              <p className="text-muted-foreground text-sm">
                Rate your experience to help build a trusted professional community.
              </p>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Button variant="hero" size="xl">
            Join ClearMarket Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
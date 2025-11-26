import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, MessageSquare, Star, Shield, Users, Lock, Wrench } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How ClearMarket Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Smarter connections. Stronger reputation. More of the right work.
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            ClearMarket helps independent Field Reps and Property Inspection Vendors connect with confidence — bringing transparency, trust, and performance to an industry that's often chaotic and underpaid.
          </p>
        </div>

        {/* For Field Reps */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-4">
            For Field Reps
          </h3>
          <p className="text-xl text-center text-accent font-semibold mb-12">Looking for work?</p>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Showcase your experience, coverage areas, and systems you use so vendors can finally see what you're really capable of — then choose the opportunities that fit you best.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Create a profile (free)</h4>
              <p className="text-muted-foreground text-sm">
                List your coverage by state and county, inspection types, systems used (EZ, IA, etc.), and your standard pricing.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Be seen by vetted vendors</h4>
              <p className="text-muted-foreground text-sm">
                Vendors searching or posting Seeking Coverage in your areas can discover you by location, platforms, and work type — not by who they already know.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-trust" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Message your network</h4>
              <p className="text-muted-foreground text-sm">
                Connect directly with vendors who unlock your profile or respond to your "Looking for Work" posts, all inside ClearMarket messaging.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Build your reputation</h4>
              <p className="text-muted-foreground text-sm">
                Earn verified reviews and trust signals based on real work completed, communication, and reliability — not public drama.
              </p>
            </Card>
          </div>
        </div>

        {/* For Vendors */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-4">
            For Vendors
          </h3>
          <p className="text-xl text-center text-accent font-semibold mb-12">Need reliable coverage?</p>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Find qualified field reps by coverage area, systems used, and inspection types — with built-in trust signals to help you choose wisely and avoid guesswork.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Post Seeking Coverage</h4>
              <p className="text-muted-foreground text-sm">
                Create posts for specific states/counties and inspection types. Set expectations upfront so reps know exactly what you need.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Search & filter reps</h4>
              <p className="text-muted-foreground text-sm">
                Use location, platforms, inspection type, and pricing alignment to see which reps actually fit your requirements before you unlock contact details.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-trust" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Unlock and connect</h4>
              <p className="text-muted-foreground text-sm">
                Spend credits to unlock rep profiles, view full coverage, pricing, and contact details, then message or invite them into your vendor network.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Monitor performance over time</h4>
              <p className="text-muted-foreground text-sm">
                Use reviews and trust indicators to see who communicates well, completes work on time, and deserves more volume.
              </p>
            </Card>
          </div>
        </div>

        {/* Trust Matters */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Trust Matters
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-card shadow-card mb-8">
              <p className="text-lg text-muted-foreground text-center mb-6">
                What sets ClearMarket apart is our focus on verified, reputation-based connections. Instead of relying on rumor threads or unverified Facebook posts, ClearMarket keeps feedback tied to real work and confirmed relationships — so scores and reviews actually mean something.
              </p>
              
              <div className="text-center">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground mb-1">Professionalism</span>
                    <span className="text-xs text-muted-foreground text-center">Measured by communication, follow-through, and reliability.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground mb-1">Reliability</span>
                    <span className="text-xs text-muted-foreground text-center">Track on-time performance and consistency across real jobs.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-trust/10 rounded-full flex items-center justify-center mb-2">
                      <MessageSquare className="h-6 w-6 text-trust" />
                    </div>
                    <span className="text-sm font-medium text-foreground mb-1">Positive verified reviews</span>
                    <span className="text-xs text-muted-foreground text-center">Reviews tied to confirmed work, with room for rebuttals and context.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground mb-1">Community engagement</span>
                    <span className="text-xs text-muted-foreground text-center">Helpful contributions in the ClearMarket community help build trust — not drama.</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Community-Driven */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            💬 Community-Driven
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-card shadow-card">
              <p className="text-lg text-muted-foreground text-center mb-4">
                ClearMarket includes a moderated Community Board for peer support, real-time updates, and reputation-building.
              </p>
              <p className="text-lg text-muted-foreground text-center">
                The more you engage — and the more helpful you are — the more your credibility grows.
              </p>
            </Card>
          </div>
        </div>

        {/* Transparency First */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            🔒 Transparency First
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-card shadow-card">
              <p className="text-lg text-muted-foreground text-center mb-4">
                We don't assign work. We don't take a cut.
              </p>
              <p className="text-lg text-muted-foreground text-center">
                We provide a transparent networking space where quality speaks for itself — and users build their own reputations through action.
              </p>
            </Card>
          </div>
        </div>

        {/* In Development */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            🚧 In Development — Built With You
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-card shadow-card mb-8">
              <p className="text-lg text-muted-foreground text-center mb-6">
                ClearMarket is in active development. We're building this platform with the inspection community — not just for it.
              </p>
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold text-foreground mb-4">As features roll out, we'll be prioritizing:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">Transparent networking tools</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mr-3">
                      <Star className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-muted-foreground">Reputation-based profiles</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-trust/10 rounded-full flex items-center justify-center mr-3">
                      <Shield className="h-4 w-4 text-trust" />
                    </div>
                    <span className="text-muted-foreground">A trusted directory of real users</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">A helpful, moderated community board</span>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground text-center">
                We appreciate your patience as we grow. Every connection, every review, and every post helps shape the future of ClearMarket — and lays the foundation for what comes next.
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
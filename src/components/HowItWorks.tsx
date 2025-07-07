import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, MessageSquare, Star, Shield, Users, Lock, Wrench } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🛠️ How ClearMarket Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Smarter Connections. Stronger Reputation. More Work.
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            ClearMarket helps independent Field Reps and Property Inspection Vendors connect with confidence — with transparency, trust, and performance at the core.
          </p>
        </div>

        {/* For Field Reps */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-4">
            👷 For Field Reps
          </h3>
          <p className="text-xl text-center text-accent font-semibold mb-12">Looking for Work?</p>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            ClearMarket lets you showcase your experience, service area, and specialties — making it easier for the right vendors to find you.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Create a profile (free)</h4>
              <p className="text-muted-foreground text-sm">
                List your service areas, inspection types, platforms used, and pricing.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Be seen by vendors</h4>
              <p className="text-muted-foreground text-sm">
                Vendors actively seeking coverage can find you through location-based searches.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-trust" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Build your reputation</h4>
              <p className="text-muted-foreground text-sm">
                Build your visibility and reputation with verified feedback from real work.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Participate in community</h4>
              <p className="text-muted-foreground text-sm">
                Participate in the community to earn credibility and unlock opportunities.
              </p>
            </Card>
          </div>
        </div>

        {/* For Vendors */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-4">
            🏢 For Vendors
          </h3>
          <p className="text-xl text-center text-accent font-semibold mb-12">Need Reliable Coverage?</p>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Find Field Reps by location, service type, and platform experience — with built-in trust signals that help you choose wisely.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Search for reps</h4>
              <p className="text-muted-foreground text-sm">
                Search for reps in your target area by location and expertise.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Unlock contact details</h4>
              <p className="text-muted-foreground text-sm">
                Unlock contact details to connect directly with qualified reps.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-trust" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Share feedback</h4>
              <p className="text-muted-foreground text-sm">
                Share feedback after working with a rep to help the community.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-card shadow-card">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Monitor performance</h4>
              <p className="text-muted-foreground text-sm">
                Monitor rep performance over time to build lasting partnerships.
              </p>
            </Card>
          </div>
        </div>

        {/* Trust Matters */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            ✅ Trust Matters
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-card shadow-card mb-8">
              <p className="text-lg text-muted-foreground text-center mb-6">
                What sets ClearMarket apart is our focus on verified, reputation-based connections. Rather than letting anyone rate anyone, only confirmed connections can leave feedback — keeping things fair and credible.
              </p>
              
              <div className="text-center">
                <h4 className="text-xl font-semibold text-foreground mb-4">Users can earn "Trusted" status by consistently demonstrating:</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Professionalism</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Reliability</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-trust/10 rounded-full flex items-center justify-center mb-2">
                      <MessageSquare className="h-6 w-6 text-trust" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Positive verified reviews</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Constructive community engagement</span>
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
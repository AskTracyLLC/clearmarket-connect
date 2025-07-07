import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Heart } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pricing & Donations
          </h2>
          
          <Card className="bg-background/80 backdrop-blur-sm border border-border shadow-professional">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Currently Free
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                ClearMarket is currently free to use during our development phase.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  We're focused on building a platform that's transparent, fair, and truly helpful for the inspection community.
                </p>
                
                <p className="text-muted-foreground leading-relaxed">
                  We haven't finalized future pricing yet — and won't until we've delivered real value. In the meantime, if you'd like to support what we're building, you're welcome to contribute a donation to help cover ongoing development and operating costs.
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-4 pt-6">
                <Button 
                  variant="hero" 
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={() => {
                    // TODO: Integrate with Stripe/PayPal
                    console.log("Donation button clicked");
                  }}
                >
                  <Heart className="h-5 w-5" />
                  Make a Donation
                </Button>
                
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Every contribution helps maintain ClearMarket and ensures the platform remains community-focused and sustainable.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";

interface SubscriptionPlansProps {
  currentPriceId?: string | null;
  onSuccess?: () => void;
}

export const SubscriptionPlans = ({ currentPriceId, onSuccess }: SubscriptionPlansProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Unlock unlimited searches and connections with a monthly membership</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const isCurrentPlan = currentPriceId === tier.price_id;
          const isPro = key === 'pro';

          return (
            <Card key={key} className={`relative ${isCurrentPlan ? 'border-primary border-2' : ''} ${isPro ? 'shadow-lg' : ''}`}>
              {isPro && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{tier.credits} ClearCredits monthly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited searches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(tier.price_id)}
                    disabled={loading === tier.price_id}
                    variant={isPro ? "default" : "outline"}
                  >
                    {loading === tier.price_id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include automatic monthly renewal. Cancel anytime.</p>
      </div>
    </div>
  );
};

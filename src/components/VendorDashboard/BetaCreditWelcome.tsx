import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const BetaCreditWelcome = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    const checkBetaCredits = async () => {
      if (!user) return;

      // Check if user has already dismissed this message
      const dismissedKey = `beta_credit_welcome_dismissed_${user.id}`;
      const dismissed = localStorage.getItem(dismissedKey);
      
      if (dismissed) {
        setHasSeenWelcome(true);
        return;
      }

      // Check if user has the beta credit bonus transaction
      const { data: transactions, error } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('transaction_type', 'beta_bonus')
        .eq('reference_type', 'vendor_signup')
        .limit(1);

      if (error) {
        console.error('Error checking beta credits:', error);
        return;
      }

      // Show welcome if they have the beta bonus and haven't dismissed it
      if (transactions && transactions.length > 0) {
        setShowWelcome(true);
      }
    };

    checkBetaCredits();
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      const dismissedKey = `beta_credit_welcome_dismissed_${user.id}`;
      localStorage.setItem(dismissedKey, 'true');
    }
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  if (!showWelcome || hasSeenWelcome) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
      
      <CardContent className="pt-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 shrink-0">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Welcome to ClearMarket Beta! 🎉</h3>
            </div>
            <p className="text-muted-foreground">
              As a beta user, you've received <span className="font-bold text-primary">25 free ClearCredits</span> to get started! 
              Use them to search for field representatives and build your network.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Coins className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">
                Additional credits can be purchased when needed
              </p>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            className="shrink-0"
          >
            Got it!
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

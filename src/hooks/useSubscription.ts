import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  price_id: string | null;
  subscription_end: string | null;
}

export const SUBSCRIPTION_TIERS = {
  starter: {
    price_id: "price_1SSPb7RJnthCkb9SPcsVC1o9",
    name: "Starter",
    price: 9.99,
    credits: 15,
    description: "Perfect for getting started"
  },
  pro: {
    price_id: "price_1SSPbBRJnthCkb9SHFPgFDew",
    name: "Pro",
    price: 24.99,
    credits: 40,
    description: "For growing businesses"
  },
  plus: {
    price_id: "price_1SSPbERJnthCkb9S9udR62wb",
    name: "Plus",
    price: 69.00,
    credits: 100,
    description: "Maximum coverage and connections"
  }
} as const;

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
      
      // Check subscription every minute
      const interval = setInterval(checkSubscription, 60000);
      return () => clearInterval(interval);
    } else {
      setStatus(null);
    }
  }, [user]);

  const getTierFromPriceId = (priceId: string | null) => {
    if (!priceId) return null;
    
    for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
      if (tier.price_id === priceId) {
        return { key, ...tier };
      }
    }
    return null;
  };

  return {
    status,
    loading,
    refetch: checkSubscription,
    currentTier: getTierFromPriceId(status?.price_id || null),
    isSubscribed: status?.subscribed || false,
  };
};

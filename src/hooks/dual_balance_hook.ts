import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DualBalance {
  repPoints: number;
  clearCredits: number;
  totalEarnedCredits: number;
  lastUpdated: string | null;
}

export const useDualBalance = () => {
  const [balance, setBalance] = useState<DualBalance>({
    repPoints: 0,
    clearCredits: 0,
    totalEarnedCredits: 0,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current balance
  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      const { data, error: balanceError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        throw balanceError;
      }

      if (data) {
        setBalance({
          repPoints: (data as any).rep_points || 0,
          clearCredits: (data as any).current_balance || 0,
          totalEarnedCredits: (data as any).earned_credits || 0,
          lastUpdated: (data as any).updated_at
        });
      } else {
        // User doesn't have a balance record yet, create one
        const { error: insertError } = await supabase
          .from('credits')
          .insert({
            user_id: user.id,
            rep_points: 0,
            current_balance: 0,
            earned_credits: 0
          });

        if (insertError) {
          console.error('Error creating initial balance:', insertError);
        }
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple balance update functions (placeholder for future functionality)
  const spendRepPoints = async (amount: number): Promise<boolean> => {
    toast({
      title: "Feature Coming Soon",
      description: "RepPoints spending will be available when giveaways are implemented.",
    });
    return false;
  };

  const spendClearCredits = async (amount: number): Promise<boolean> => {
    toast({
      title: "Feature Coming Soon", 
      description: "ClearCredits spending will be available with premium features.",
    });
    return false;
  };

  // Subscribe to balance changes
  useEffect(() => {
    fetchBalance();

    // Set up real-time subscription for balance changes
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('balance_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'credits',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchBalance(); // Refresh balance when it changes
          }
        )
        .subscribe();

      return subscription;
    };

    let subscription: any;
    setupSubscription().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    spendRepPoints,
    spendClearCredits
  };
};
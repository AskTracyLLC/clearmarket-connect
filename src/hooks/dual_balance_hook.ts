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
        .from('user_balances')
        .select('rep_points, clear_credits, total_earned_credits, updated_at')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        throw balanceError;
      }

      if (data) {
        setBalance({
          repPoints: data.rep_points || 0,
          clearCredits: data.clear_credits || 0,
          totalEarnedCredits: data.total_earned_credits || 0,
          lastUpdated: data.updated_at
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

  // Spend RepPoints on giveaway entries
  const spendRepPoints = async (
    amount: number, 
    giveawayId: string, 
    giveawayType: 'monthly' | 'vendor_network',
    entryCount: number = 1
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('spend_rep_points', {
        spender_user_id: (await supabase.auth.getUser()).data.user?.id,
        points_amount: amount,
        giveaway_id_param: giveawayId,
        giveaway_type_param: giveawayType,
        entry_count_param: entryCount
      });

      if (error) throw error;

      if (data) {
        // Refresh balance after successful spending
        await fetchBalance();
        toast({
          title: "RepPoints Spent Successfully!",
          description: `You've entered the giveaway with ${entryCount} entr${entryCount === 1 ? 'y' : 'ies'}.`,
        });
        return true;
      } else {
        toast({
          title: "Transaction Failed",
          description: "Insufficient RepPoints or giveaway not available.",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to spend RepPoints';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Spend ClearCredits on platform features
  const spendClearCredits = async (
    amount: number,
    referenceId?: string,
    referenceType?: string,
    metadata?: any
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('spend_clear_credits', {
        spender_user_id: (await supabase.auth.getUser()).data.user?.id,
        amount_param: amount,
        reference_id_param: referenceId,
        reference_type_param: referenceType,
        metadata_param: metadata
      });

      if (error) throw error;

      if (data) {
        // Refresh balance after successful spending
        await fetchBalance();
        toast({
          title: "ClearCredits Spent Successfully!",
          description: "Your premium feature has been activated.",
        });
        return true;
      } else {
        toast({
          title: "Transaction Failed",
          description: "Insufficient ClearCredits.",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to spend ClearCredits';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Check giveaway eligibility
  const checkGiveawayEligibility = async (
    giveawayId: string,
    giveawayType: 'monthly' | 'vendor_network'
  ) => {
    try {
      const { data, error } = await supabase.rpc('get_giveaway_eligibility', {
        user_id_param: (await supabase.auth.getUser()).data.user?.id,
        giveaway_id_param: giveawayId,
        giveaway_type_param: giveawayType
      });

      if (error) throw error;
      return data[0]; // Function returns a table, get first row
    } catch (err) {
      console.error('Error checking eligibility:', err);
      return null;
    }
  };

  // Subscribe to balance changes
  useEffect(() => {
    fetchBalance();

    // Set up real-time subscription for balance changes
    const { data: { user } } = supabase.auth.getUser();
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    spendRepPoints,
    spendClearCredits,
    checkGiveawayEligibility
  };
};
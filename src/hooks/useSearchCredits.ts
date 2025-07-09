import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaidFilter {
  platforms: boolean;
  abcRequired: boolean;
  hudKeyRequired: boolean;
  inspectionTypes: boolean;
}

export const useSearchCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paidFilters, setPaidFilters] = useState<PaidFilter>({
    platforms: false,
    abcRequired: false,
    hudKeyRequired: false,
    inspectionTypes: false,
  });
  const [isSpendingCredits, setIsSpendingCredits] = useState(false);

  const calculateCreditCost = (
    platforms: string[],
    abcRequired: boolean | null,
    hudKeyRequired: boolean | null,
    inspectionTypes: string[]
  ) => {
    let cost = 0;
    if (platforms.length > 0 && !paidFilters.platforms) cost += 1;
    if (abcRequired === true && !paidFilters.abcRequired) cost += 1;
    if (hudKeyRequired === true && !paidFilters.hudKeyRequired) cost += 1;
    if (inspectionTypes.length > 0 && !paidFilters.inspectionTypes) cost += 1;
    return cost;
  };

  const spendCreditsForSearch = useCallback(async (
    platforms: string[],
    abcRequired: boolean | null,
    hudKeyRequired: boolean | null,
    inspectionTypes: string[]
  ) => {
    if (!user) return false;

    const creditCost = calculateCreditCost(platforms, abcRequired, hudKeyRequired, inspectionTypes);
    if (creditCost === 0) return true;

    setIsSpendingCredits(true);

    try {
      // Check current balance
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('current_balance')
        .eq('user_id', user.id)
        .single();

      if (creditsError || !creditsData) {
        toast({
          title: "Error",
          description: "Unable to check credit balance",
          variant: "destructive",
        });
        return false;
      }

      if ((creditsData.current_balance || 0) < creditCost) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${creditCost} credit${creditCost > 1 ? 's' : ''} for this search. Please purchase more credits.`,
          variant: "destructive",
        });
        return false;
      }

      // Spend credits
      const { data, error } = await supabase.rpc('spend_credits', {
        spender_user_id: user.id,
        amount_param: creditCost,
        reference_type_param: 'search_filter',
        metadata_param: {
          platforms: platforms.length > 0 && !paidFilters.platforms,
          abcRequired: abcRequired === true && !paidFilters.abcRequired,
          hudKeyRequired: hudKeyRequired === true && !paidFilters.hudKeyRequired,
          inspectionTypes: inspectionTypes.length > 0 && !paidFilters.inspectionTypes,
        }
      });

      if (error || !data) {
        toast({
          title: "Payment Failed",
          description: "Unable to process credit payment",
          variant: "destructive",
        });
        return false;
      }

      // Update paid filters
      const newPaidFilters = { ...paidFilters };
      if (platforms.length > 0 && !paidFilters.platforms) newPaidFilters.platforms = true;
      if (abcRequired === true && !paidFilters.abcRequired) newPaidFilters.abcRequired = true;
      if (hudKeyRequired === true && !paidFilters.hudKeyRequired) newPaidFilters.hudKeyRequired = true;
      if (inspectionTypes.length > 0 && !paidFilters.inspectionTypes) newPaidFilters.inspectionTypes = true;
      
      setPaidFilters(newPaidFilters);

      toast({
        title: "Credits Spent",
        description: `${creditCost} credit${creditCost > 1 ? 's' : ''} spent for enhanced search results`,
      });

      return true;
    } catch (error) {
      console.error('Error spending credits:', error);
      toast({
        title: "Error",
        description: "An error occurred while processing payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSpendingCredits(false);
    }
  }, [user, paidFilters, toast]);

  const resetPaidFilters = () => {
    setPaidFilters({
      platforms: false,
      abcRequired: false,
      hudKeyRequired: false,
      inspectionTypes: false,
    });
  };

  return {
    paidFilters,
    isSpendingCredits,
    calculateCreditCost,
    spendCreditsForSearch,
    resetPaidFilters,
  };
};
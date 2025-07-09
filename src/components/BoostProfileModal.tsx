import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BoostProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trustScore: number;
  profileComplete: number;
  onBoostComplete?: () => void;
}

const BoostProfileModal = ({ 
  open, 
  onOpenChange, 
  trustScore, 
  profileComplete, 
  onBoostComplete 
}: BoostProfileModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [boostCost, setBoostCost] = useState(5);
  const { user } = useAuth();
  const { toast } = useToast();

  const isEligible = trustScore >= 80 && profileComplete >= 100;
  const hasEnoughCredits = currentCredits >= boostCost;

  useEffect(() => {
    if (open && user) {
      fetchCreditsAndCost();
    }
  }, [open, user]);

  const fetchCreditsAndCost = async () => {
    try {
      // Get current credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('current_balance')
        .eq('user_id', user!.id)
        .single();

      setCurrentCredits(creditsData?.current_balance || 0);

      // Get boost cost from admin rules
      const { data: ruleData } = await supabase
        .from('credit_earning_rules')
        .select('credit_amount')
        .eq('rule_name', 'boost_cost')
        .single();

      if (ruleData) {
        setBoostCost(Math.abs(ruleData.credit_amount));
      }
    } catch (error) {
      console.error('Error fetching boost data:', error);
    }
  };

  const handleBoost = async () => {
    if (!user || !isEligible || !hasEnoughCredits) return;

    setIsProcessing(true);

    try {
      // Spend credits for boost
      const { data: spendResult, error: spendError } = await supabase.rpc('spend_credits', {
        spender_user_id: user.id,
        amount_param: boostCost,
        reference_type_param: 'profile_boost'
      });

      if (spendError || !spendResult) {
        throw new Error('Failed to process boost payment');
      }

      // Set boost expiration (7 days from now)
      const boostExpiration = new Date();
      boostExpiration.setDate(boostExpiration.getDate() + 7);

      const { error: updateError } = await supabase
        .from('users')
        .update({ boost_expiration: boostExpiration.toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile Boosted!",
        description: `Your profile will appear higher in search results for 7 days.`,
      });

      onBoostComplete?.();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Boost error:', error);
      toast({
        title: "Boost Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Boost Your Profile
          </DialogTitle>
          <DialogDescription>
            Increase your visibility in search results for 7 days
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Boost Cost</span>
                <Badge variant="outline">{boostCost} Credits</Badge>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span>Your Credits</span>
                <span className={currentCredits >= boostCost ? "text-green-600" : "text-red-600"}>
                  {currentCredits}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Boost duration: 7 days
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Check */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold">Eligibility Requirements</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Trust Score (min 80)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{trustScore}</span>
                  {trustScore >= 80 ? (
                    <Badge variant="default" className="text-xs">✓</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">✗</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Profile Complete (100%)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{profileComplete}%</span>
                  {profileComplete >= 100 ? (
                    <Badge variant="default" className="text-xs">✓</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">✗</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Sufficient Credits</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{currentCredits}/{boostCost}</span>
                  {hasEnoughCredits ? (
                    <Badge variant="default" className="text-xs">✓</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">✗</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isEligible && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                {trustScore < 80 && "Increase your Trust Score by receiving verified reviews. "}
                {profileComplete < 100 && "Complete your profile to 100%. "}
              </div>
            </div>
          )}

          {!hasEnoughCredits && isEligible && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                You need {boostCost - currentCredits} more credits to boost your profile.
              </div>
            </div>
          )}

          <Button 
            onClick={handleBoost}
            disabled={!isEligible || !hasEnoughCredits || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : `Boost Profile (${boostCost} Credits)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostProfileModal;
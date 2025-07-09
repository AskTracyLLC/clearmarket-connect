import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Unlock, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UnlockContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    id: string;
    display_name: string;
    role: string;
  };
  userCredits: number;
  onUnlockSuccess: () => void;
}

const UNLOCK_COST = 1; // 1 credit to unlock contact info

const UnlockContactModal = ({ 
  open, 
  onOpenChange, 
  targetUser, 
  userCredits, 
  onUnlockSuccess 
}: UnlockContactModalProps) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState<'success' | 'error' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUnlock = async () => {
    if (userCredits < UNLOCK_COST) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${UNLOCK_COST} credit to unlock contact information. Please earn or purchase more credits.`,
        variant: "destructive",
      });
      return;
    }

    setIsUnlocking(true);
    
    try {
      if (!user) throw new Error('User not authenticated');

      // First, spend the credits
      const { data: spendResult, error: spendError } = await supabase.rpc('spend_credits', {
        spender_user_id: user.id,
        amount_param: UNLOCK_COST,
        reference_id_param: targetUser.id,
        reference_type_param: 'contact_unlock',
        metadata_param: { target_user_role: targetUser.role }
      });

      if (spendError || !spendResult) {
        throw new Error('Failed to spend credits');
      }

      // Then create the contact unlock record
      const { error: unlockError } = await supabase
        .from('contact_unlocks')
        .insert({
          unlocker_id: user.id,
          unlocked_user_id: targetUser.id,
          method: 'credit'
        });

      if (unlockError) {
        throw unlockError;
      }

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            emailType: 'unlock_confirmation',
            toEmail: user.email,
            userId: user.id,
            templateData: {
              unlockerName: user.email,
              unlockedName: targetUser.display_name,
              creditsUsed: UNLOCK_COST
            }
          }
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      setUnlockResult('success');
      toast({
        title: "Contact Unlocked!",
        description: `You can now view ${targetUser.display_name}'s contact information.`,
      });
      
      // Trigger success callback to refresh data
      onUnlockSuccess();
      
    } catch (error) {
      console.error('Unlock error:', error);
      setUnlockResult('error');
      toast({
        title: "Unlock Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleClose = () => {
    setUnlockResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Unlock Contact Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {unlockResult === 'success' ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully unlocked contact information for <strong>{targetUser.display_name}</strong>. 
                You can now message them directly and see their full contact details.
              </AlertDescription>
            </Alert>
          ) : unlockResult === 'error' ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to unlock contact information. Please try again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Unlock {targetUser.display_name}'s Contact Info
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get access to their email, phone number, and direct messaging
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm font-medium">Cost:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {UNLOCK_COST} Credit
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm font-medium">Your Balance:</span>
                  <Badge variant={userCredits >= UNLOCK_COST ? "default" : "destructive"}>
                    {userCredits} Credits
                  </Badge>
                </div>

                {userCredits < UNLOCK_COST && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have enough credits. You need {UNLOCK_COST - userCredits} more credit(s).
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {unlockResult === 'success' ? (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUnlock}
                disabled={isUnlocking || userCredits < UNLOCK_COST}
                className="flex-1"
              >
                {isUnlocking ? (
                  <>Unlocking...</>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock for {UNLOCK_COST} Credit
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockContactModal;
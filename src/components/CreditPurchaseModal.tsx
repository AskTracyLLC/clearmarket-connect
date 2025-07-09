import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

const creditPacks = [
  {
    credits: 5,
    price: "$4.99",
    description: "Perfect for getting started",
    popular: false
  },
  {
    credits: 10,
    price: "$8.99",
    description: "Most popular choice",
    popular: true
  },
  {
    credits: 20,
    price: "$15.99",
    description: "Best value for power users",
    popular: false
  }
];

const CreditPurchaseModal = ({ open, onOpenChange, onPurchaseComplete }: CreditPurchaseModalProps) => {
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePurchase = async (creditPack: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase credits.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSelectedPack(creditPack);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { creditPack }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');

      toast({
        title: "Redirecting to Payment",
        description: "Complete your purchase in the new tab.",
      });

      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Payment creation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedPack(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit pack to unlock contacts and boost your profile
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {creditPacks.map((pack) => (
            <Card 
              key={pack.credits}
              className={`relative cursor-pointer transition-all hover:shadow-md ${
                pack.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {pack.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{pack.credits}</CardTitle>
                <CardDescription>Credits</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">{pack.price}</div>
                <p className="text-sm text-muted-foreground">{pack.description}</p>
                
                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(pack.credits)}
                  disabled={isProcessing}
                  variant={pack.popular ? "default" : "outline"}
                >
                  {isProcessing && selectedPack === pack.credits ? (
                    "Processing..."
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">What can you do with credits?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Unlock contact information (1 credit per contact)</li>
            <li>• Boost your profile visibility (5 credits for 7 days)</li>
            <li>• Access premium search filters</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditPurchaseModal;
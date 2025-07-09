import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [creditsAdded, setCreditsAdded] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');
  const expectedCredits = searchParams.get('credits');

  useEffect(() => {
    if (sessionId && user) {
      verifyPayment();
    }
  }, [sessionId, user]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('complete-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      setCreditsAdded(data.creditsAdded);
      
      toast({
        title: "Payment Successful!",
        description: `${data.creditsAdded} credits have been added to your account.`,
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Verifying your payment...</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Your credits have been added to your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Credits Added</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {creditsAdded || expectedCredits}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">What's Next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use credits to unlock contact information</li>
                  <li>• Boost your profile for better visibility</li>
                  <li>• Access premium search features</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/vendor/search">
                    Start Searching
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/vendor/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
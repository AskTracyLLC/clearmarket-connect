import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EmailVerificationPage = () => {
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkEmailVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || "");
        setIsVerified(!!user.email_confirmed_at);
        
        // If already verified, redirect to dashboard
        if (user.email_confirmed_at) {
          window.location.href = "/";
        }
      }
    };

    checkEmailVerification();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified. Redirecting...",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
      
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. Redirecting you to the dashboard...
                </CardDescription>
              </CardHeader>
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
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to <strong>{userEmail}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You need to verify your email before accessing community features, 
                  messaging, or unlocking contact information.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your email inbox for a message from ClearMarket</li>
                    <li>Click the verification link in the email</li>
                    <li>You'll be automatically redirected back here</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Don't see the email?</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure {userEmail} is correct</li>
                    <li>Wait a few minutes and try resending</li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    supabase.auth.signOut();
                    window.location.href = "/auth";
                  }}
                >
                  Sign in with a different email
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

export default EmailVerificationPage;
import Header from '@/components/Header';
import { FeedbackBoardNew } from '@/components/FeedbackBoardNew';
import Footer from '@/components/Footer';
import { useFeedbackAuth } from '@/hooks/useFeedbackAuth';
import { FeedbackSignInForm } from '@/components/FeedbackSignInForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Mail, AlertCircle } from 'lucide-react';

const FeedbackPage = () => {
  const { user, isLoading, logout, isAuthenticated } = useFeedbackAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2">Feedback Group Access Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This is a private feedback community for ClearMarket members. Access is restricted to prevent spam and maintain quality discussions.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg text-left">
                <h3 className="font-semibold text-sm text-foreground mb-2">How to get access:</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Sign up for ClearMarket launch notifications on our homepage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Check the "Join Feedback Group" option during signup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Check your email for a secure access link</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Access links expire after 24 hours for security</span>
              </div>

              <FeedbackSignInForm />

              <div className="text-center text-sm text-muted-foreground">
                Don't have access yet?
              </div>

              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                Sign Up for Access
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                Logged in as <span className="font-semibold text-primary">{user.anonymousUsername}</span>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      <FeedbackBoardNew />
      <Footer />
    </div>
  );
};

export default FeedbackPage;
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SecureFormField from '@/components/ui/secure-form-field';
import RecaptchaWrapper from '@/components/ui/recaptcha-wrapper';
import { useSecureAuth, useSecureRateLimit } from '@/hooks/useSecureAuth';
import { isValidPassword, checkAdminRole } from '@/utils/security';
import { ComprehensiveSignupForm, SignupFormData } from '@/components/ComprehensiveSignupForm';
import { useUserCount } from '@/hooks/useUserCount';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, user, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { count: userCount } = useUserCount();

  useEffect(() => {
    if (user) {
      // Immediately send authenticated users to NDA to avoid getting stuck on /auth
      navigate('/nda');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "Signing in...",
        description: "Please wait while we redirect you.",
      });
      // Don't set loading to false - let AuthContext handle the redirect
      // The loading state will be cleared when the page changes
    }
  };

  const handleSignUp = async (formData: SignupFormData) => {
    setLoading(true);

    try {
      // Generate a random password since we removed the password field
      const tempPassword = `Cm!${Math.random().toString(36).slice(-6)}9A`;
      
      // Use dedicated verification handler route
      const redirectUrl = `${window.location.origin}/auth/verify`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: formData.userRole,
            experience_level: formData.experienceLevel,
            primary_state: formData.primaryState,
            work_types: formData.workTypes
          }
        }
      });

      if (error) {
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to ClearMarket!",
          description: "An email has been sent with your login credentials. Check your inbox to complete the process.",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error creating account",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for instructions to reset your password.",
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <ClearMarketLogo size={48} />
            </div>
            <h1 className="text-2xl font-bold">Welcome to ClearMarket</h1>
            <p className="text-muted-foreground">Sign in to access your account</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email or Username</Label>
                      <Input
                        id="signin-email"
                        type="text"
                        placeholder="Enter your email or username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={resetLoading}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                      >
                        {resetLoading ? "Sending..." : "Forgot your password?"}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Join ClearMarket - Help Shape Our Platform</CardTitle>
                  <CardDescription>
                    Sign up to join the professional network for field inspections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComprehensiveSignupForm onSubmit={handleSignUp} loading={loading} />
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {userCount !== null && `Join ${userCount}+ professionals already signed up`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

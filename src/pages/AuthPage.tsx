import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'field-rep' | 'vendor'>('field-rep');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUserRedirect = async () => {
      if (user) {
        // SECURITY: Use secure database role checking instead of hardcoded emails
        const isAdmin = await checkAdminRole(user.id);
        if (isAdmin) {
          console.log('✅ AuthPage: Admin user detected - staying on auth page for manual redirect');
          return;
        }
        // Redirect to NDA page instead of index to avoid redirect loop
        navigate('/nda');
      }
    };

    handleUserRedirect();
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
    } else {
      // SECURITY: Use secure database role checking instead of hardcoded emails
      const user = (await supabase.auth.getUser()).data.user;
      
      if (user) {
        const isAdmin = await checkAdminRole(user.id);
        
        if (isAdmin) {
          // Admin user - redirect directly to admin dashboard
          navigate('/admin');
          toast({
            title: "Welcome back, Admin!",
            description: "You have successfully signed in.",
          });
        } else {
        // For non-admin users, check NDA status first
        try {
          // Check both nda_signatures table AND users.nda_signed field
          const [ndaSignatureResponse, userDataResponse] = await Promise.all([
            supabase
              .from('nda_signatures')
              .select('*')
              .eq('user_id', user?.id)
              .eq('is_active', true)
              .maybeSingle(),
            supabase
              .from('users')
              .select('role, nda_signed')
              .eq('id', user?.id)
              .single()
          ]);

          const { data: ndaSignature, error: ndaError } = ndaSignatureResponse;
          const { data: userData, error: userError } = userDataResponse;

          if (ndaError) {
            console.error('Error checking NDA status:', ndaError);
          }
          
          if (userError) {
            console.error('Error fetching user data:', userError);
          }

          // Check if NDA process is complete (both signature exists AND users.nda_signed is true)
          const ndaCompleted = ndaSignature && userData?.nda_signed;

          // If user hasn't completed NDA process, redirect to NDA page
          if (!ndaCompleted) {
            navigate('/nda');
            toast({
              title: "Welcome back!",
              description: "Please review and sign the agreement to continue.",
            });
            return;
          }

          // User has completed NDA, redirect to appropriate dashboard based on role
          switch (userData?.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'moderator':
              navigate('/moderator');
              break;
            case 'vendor':
              navigate('/vendor/dashboard');
              break;
            case 'field_rep':
              navigate('/fieldrep/dashboard');
              break;
            default:
              navigate('/');
          }

          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } catch (roleError) {
          console.error('Error fetching user role or NDA status:', roleError);
          // Fallback to NDA page if anything fails for non-admin users
          navigate('/nda');
          toast({
            title: "Welcome back!",
            description: "Please complete your account setup.",
          });
        }
        }
      }
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use dedicated verification handler route
      const redirectUrl = `${window.location.origin}/auth/verify`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: userRole
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
          title: "Account created!",
          description: "Please check your email to verify your account.",
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

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

          <Tabs defaultValue="signin" className="space-y-4">
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
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
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
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Sign up to join the ClearMarket community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-role">I am a</Label>
                      <Select value={userRole} onValueChange={(value: 'field-rep' | 'vendor') => setUserRole(value)}>
                        <SelectTrigger id="user-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="field-rep">Field Representative</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
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

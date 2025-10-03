import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';

const BetaRegister = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          title: "Invalid Registration Link",
          description: "No registration token provided.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('beta_registration_tokens')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Invalid Registration Link",
            description: "This registration link is invalid or has expired.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (data.used_at) {
          toast({
            title: "Registration Link Already Used",
            description: "This registration link has already been used.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          toast({
            title: "Registration Link Expired",
            description: "This registration link has expired. Please request a new one.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setTokenData(data);
      } catch (error) {
        console.error('Error validating token:', error);
        toast({
          title: "Error",
          description: "Failed to validate registration link.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setTokenLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tokenData.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/nda`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Mark token as used
        const { error: tokenError } = await supabase
          .from('beta_registration_tokens')
          .update({ 
            used_at: new Date().toISOString(),
            created_user_id: authData.user.id
          })
          .eq('token', token);

        if (tokenError) {
          console.error('Error updating token:', tokenError);
        }

        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account, then sign in to continue.",
        });

        // Redirect to auth page for email verification
        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ClearMarketLogo size={48} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Validating registration link...</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <ClearMarketLogo size={48} />
            </div>
            <h1 className="text-2xl font-bold">Complete Registration</h1>
            <p className="text-muted-foreground">
              Create your password to join ClearMarket
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Account Details
              </CardTitle>
              <CardDescription>
                You're registering as a {tokenData.user_type === 'field-rep' ? 'Field Representative' : 'Vendor'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm text-muted-foreground">{tokenData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Username:</span>
                    <p className="text-sm text-muted-foreground">{tokenData.anonymous_username}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Account Type:</span>
                    <p className="text-sm text-muted-foreground">
                      {tokenData.user_type === 'field-rep' ? 'Field Representative' : 'Vendor'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account & Continue"}
                  </Button>
                </div>
              </form>

              <div className="text-xs text-muted-foreground text-center">
                After creating your account, you'll need to verify your email and sign the User Agreement before accessing your profile.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BetaRegister;
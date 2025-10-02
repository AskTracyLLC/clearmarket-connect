import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';

const AdminAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is a bypass access attempt
  const isBypass = searchParams.get('bypass') === 'admin';

  useEffect(() => {
    if (user && !isBypass) {
      // If user is already authenticated and not using bypass, check if they have a profile
      const fetchUserRoleAndRedirect = async () => {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single to handle no results

          if (userError) throw userError;

          // If no profile exists, let them stay on admin-auth page to sign in fresh
          if (!userData) {
            console.log('No user profile found, allowing fresh admin auth');
            return;
          }

          // Check user role and redirect to appropriate dashboard
          switch (userData.role) {
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
              console.log('Unknown role, staying on admin-auth');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Don't redirect on error, let them try admin auth
          console.log('Error fetching role, allowing admin auth attempt');
        }
      };

      fetchUserRoleAndRedirect();
    }
  }, [user, navigate, isBypass]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Starting admin sign in process...');

    try {
      // Simple, direct authentication without timeout
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Admin sign in response:', { data, error });
      
      if (error) {
        console.error('Admin sign in error:', error);
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log('Admin sign in successful:', data);
        
        // Check database role for all users
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (userError) {
            console.error('Error fetching user role:', userError);
            // If role check fails but user is authenticated, default to admin for admin-auth page
            navigate('/admin');
            return;
          }

          // Redirect based on role
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
              // No role in database, default to admin for admin-auth page
              navigate('/admin');
          }

          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } catch (roleError) {
          console.error('Error in role check:', roleError);
          // If anything fails, default to admin since they used admin-auth
          navigate('/admin');
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected admin sign in error:', error);
      toast({
        title: "Error signing in",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      console.log('Admin sign in process completed, setting loading to false');
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
        redirectTo: `${window.location.origin}/admin-auth?reset=true`,
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
          <span className="text-sm">Back to ClearMarket</span>
        </Link>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <ClearMarketLogo size={48} />
            </div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">Administrative access to ClearMarket</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admin Sign In</CardTitle>
              <CardDescription>
                Enter your admin credentials to access the admin dashboard
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
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
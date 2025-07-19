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
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is a bypass access attempt
  const isBypass = searchParams.get('bypass') === 'admin';

  useEffect(() => {
    if (user && !isBypass) {
      // If user is already authenticated and not using bypass, redirect to appropriate dashboard
      const fetchUserRoleAndRedirect = async () => {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

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
              navigate('/prelaunch');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          navigate('/prelaunch');
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
      // Use a timeout to detect hanging quickly
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const result = await Promise.race([authPromise, timeoutPromise]);
      const { data, error } = result as any;
      
      console.log('Admin sign in response:', { data, error });
      
      if (error) {
        console.error('Admin sign in error:', error);
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Admin sign in successful:', data);
        
        // Fetch user role and redirect to appropriate dashboard
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user?.id)
            .single();

          if (userError) throw userError;

          // Redirect based on role
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
              navigate('/prelaunch');
          }

          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } catch (roleError) {
          console.error('Error fetching user role:', roleError);
          // Fallback to admin dashboard for admin portal
          navigate('/admin');
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected admin sign in error:', error);
      if (error.message === 'Request timeout') {
        toast({
          title: "Authentication timeout",
          description: "Login is taking too long. Trying direct admin access...",
          variant: "destructive",
        });
        
        // Try direct navigation to admin dashboard
        console.log('Attempting fallback navigation to admin dashboard...');
        navigate('/admin');
      } else {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      console.log('Admin sign in process completed, setting loading to false');
      setLoading(false);
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
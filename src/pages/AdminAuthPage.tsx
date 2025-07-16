import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Fetch user role and redirect to appropriate dashboard
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
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
        // Fallback to prelaunch page if role fetch fails
        navigate('/prelaunch');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Admin Access Portal</span>
        </div>

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
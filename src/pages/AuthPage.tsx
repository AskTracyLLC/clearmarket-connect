import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Shield, Lock } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if this is an admin login attempt
  const isAdminLogin = searchParams.get('admin') === 'true';

  useEffect(() => {
    if (user) {
      navigate('/');
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
    } else {
      // Fetch user role and redirect to appropriate dashboard
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (userError) throw userError;

        // If this was an admin login attempt, verify admin role
        if (isAdminLogin && userData.role !== 'admin') {
          await signOut(); // Sign them out
          toast({
            title: "Access Denied",
            description: "Admin access required for this area.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Redirect based on role
        switch (userData.role) {
          case 'admin':
            navigate('/admin');
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the admin dashboard.",
            });
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

        if (!isAdminLogin) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      } catch (roleError) {
        console.error('Error fetching user role:', roleError);
        // Fallback to home page if role fetch fails
        navigate('/');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password);

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

    setLoading(false);
  };

  // Admin Login Component
  const AdminLoginCard = () => (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Shield className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5" />
          Admin Access
        </CardTitle>
        <CardDescription>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Restricted Area
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clearmarket.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Shield className="h-4 w-4 mr-2" />
            {loading ? "Verifying Admin Access..." : "Access Admin Dashboard"}
          </Button>
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  // Regular Login/Signup Component
  const RegularAuthTabs = () => (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your ClearMarket account
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
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Home Link */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-foreground">ClearMarket</span>
            </div>
            {isAdminLogin && (
              <p className="text-sm text-muted-foreground">
                Admin authentication required
              </p>
            )}
          </div>

          {/* Conditional Rendering based on admin parameter */}
          {isAdminLogin ? <AdminLoginCard /> : <RegularAuthTabs />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

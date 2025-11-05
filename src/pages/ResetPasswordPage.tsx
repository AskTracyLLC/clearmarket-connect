import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [errorCodeState, setErrorCodeState] = useState<string | null>(null);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const autoResentRef = useRef(false);

  // Helper to ensure a valid Supabase session from URL tokens/hash
  const ensureSessionFromUrl = async (): Promise<boolean> => {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash') || hashParams.get('token') || queryParams.get('token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) return true;
      }

      if (tokenHash && !accessToken) {
        const { data, error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (!error && data?.user) return true;
      }
    } catch (e) {
      console.error('ensureSessionFromUrl error:', e);
    }
    return false;
  };

  // (removed duplicate ensureSessionFromUrl)

  // Verify tokens/session on mount and hydrate session if needed
  useEffect(() => {
    const initFromUrl = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      const type = hashParams.get('type') || queryParams.get('type');
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
      const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash') || hashParams.get('token') || queryParams.get('token');

      if (errorCode) {
        setErrorCodeState(errorCode);
        setErrorDesc(errorDescription || 'This password reset link is invalid or has expired. Please request a new one.');
        toast({
          title: 'Invalid Reset Link',
          description: errorDescription || 'This password reset link is invalid or has expired. We will send you a fresh link.',
          variant: 'destructive',
        });
        // Auto-resend a fresh link when scanners consume the OTP
        const emailParam = queryParams.get('email');
        const shouldAutoResend = ['otp_expired','access_denied','one_time_token','token_not_found'].includes(errorCode);
        if (emailParam && shouldAutoResend && !autoResentRef.current) {
          try {
            autoResentRef.current = true;
            setResending(true);
            await supabase.functions.invoke('send-password-reset', { body: { email: emailParam } });
            toast({
              title: 'Sent a fresh reset link',
              description: `We sent a new link to ${emailParam}. Open the latest email on this device.`,
            });
          } catch (err: any) {
            console.error('auto-resend failed:', err);
            toast({
              title: 'Could not resend automatically',
              description: 'Tap "Resend" below or request again from the sign-in page.',
              variant: 'destructive',
            });
          } finally {
            setResending(false);
          }
        }
        // Continue to attempt session hydration just in case
      }

      // If we don't have session tokens but do have a token hash, verify it to establish a session
      if (!accessToken && tokenHash) {
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (verifyError) {
          console.error('verifyOtp error:', verifyError);
          toast({
            title: 'Invalid Reset Link',
            description: 'This password reset link is invalid or has expired. Please request a new one.',
            variant: 'destructive',
          });
          return;
        }
      }

      // If tokens are present, explicitly set the session to ensure updateUser works
      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) {
          console.error('setSession error:', setSessionError);
          toast({
            title: 'Invalid Reset Link',
            description: 'This password reset link is invalid or has expired. Please request a new one.',
            variant: 'destructive',
          });
          return;
        }
      }

      // As a final guard, ensure we have a user session before allowing password change
      const { data: { user } } = await supabase.auth.getUser();
      setSessionReady(!!user);
      if (!user && type !== 'recovery') {
        toast({
          title: 'Invalid Reset Link',
          description: 'This reset link did not establish a secure session. Please open the link from your email again.',
          variant: 'destructive',
        });
      }
    };

    initFromUrl();
  }, [toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Ensure an active auth session exists before attempting update
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await ensureSessionFromUrl();
        ({ data: { user } } = await supabase.auth.getUser());
      }
      if (!user) {
        setLoading(false);
        toast({
          title: 'Invalid Reset Link',
          description: 'No active session found. Open the reset link from your email again.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        // Attempt to rehydrate session and retry once if session was missing
        if (error.message && error.message.toLowerCase().includes('auth session')) {
          await ensureSessionFromUrl();
          const retry = await supabase.auth.updateUser({ password: newPassword });
          if (!retry.error) {
            toast({
              title: 'Password Updated!',
              description: 'Your password has been successfully updated. Please log in with your new password.',
            });
            await supabase.auth.signOut();
            setTimeout(() => {
              window.location.href = '/auth';
            }, 2000);
            return;
          }
        }
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('✅ Password update successful');
        
        // CRITICAL: Store the user email before signing out
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const userEmail = currentUser?.email;
        
        toast({
          title: "Password Updated!",
          description: "Your password has been successfully updated. You'll be redirected to log in.",
        });
        
        // Sign out to clear the recovery session
        await supabase.auth.signOut();
        
        // Redirect with email pre-filled after a delay
        setTimeout(() => {
          const loginUrl = userEmail 
            ? `/auth?email=${encodeURIComponent(userEmail)}`
            : '/auth';
          window.location.href = loginUrl;
        }, 2500);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const emailFromQuery = searchParams.get('email');
    if (!emailFromQuery) {
      toast({
        title: 'Missing email',
        description: 'Open the latest reset email or go back to the sign-in page to request a new link.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setResending(true);
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: emailFromQuery },
      });
      if (error) throw error;
      toast({
        title: 'Reset email sent',
        description: `We sent a new link to ${emailFromQuery}. Open it on this device.`,
      });
    } catch (err: any) {
      toast({
        title: 'Could not resend',
        description: err?.message || 'Please try again from the sign-in page.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <ClearMarketLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Choose a strong password to secure your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-sm text-destructive">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !sessionReady || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              >
                {loading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {errorCodeState && (
          <div className="mt-4 p-4 border border-border rounded-md text-sm">
            <p className="mb-2 text-muted-foreground">{errorDesc}</p>
            {searchParams.get('email') && (
              <Button onClick={handleResend} disabled={resending} className="w-full sm:w-auto">
                {resending ? 'Resending...' : `Resend to ${searchParams.get('email')}`}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

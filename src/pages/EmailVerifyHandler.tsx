import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Email Verification Handler Page
 * 
 * This page handles Supabase email verification by detecting when a session
 * is established after the user clicks the verification link. It then redirects
 * users to the appropriate page based on their role and NDA signing status.
 */
const EmailVerifyHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Finalizing verification...');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isProcessed = false;

    const processVerification = async (user: any) => {
      if (isProcessed) return;
      isProcessed = true;

      try {
        // Check if user is verified
        if (!user.email_confirmed_at) {
          setStatus('error');
          setMessage('Email verification is still pending.');
          return;
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting...');

        // Check if user is admin
        const isAdmin = user.email === 'rehawby@gmail.com' || user.email === 'rewby1@gmail.com';
        
        if (isAdmin) {
          toast({
            title: "Welcome back, Admin!",
            description: "Redirecting to your dashboard.",
          });
          navigate('/admin');
          return;
        }

        // For regular users, check NDA status
        const [ndaSignatureResponse, userDataResponse] = await Promise.all([
          supabase
            .from('nda_signatures')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle(),
          supabase
            .from('users')
            .select('role, nda_signed')
            .eq('id', user.id)
            .single()
        ]);

        const { data: ndaSignature } = ndaSignatureResponse;
        const { data: userData } = userDataResponse;

        const ndaCompleted = ndaSignature && userData?.nda_signed;

        if (!ndaCompleted) {
          toast({
            title: "Welcome to ClearMarket!",
            description: "Please review and sign the beta agreement to continue.",
          });
          navigate('/beta-nda');
        } else {
          switch (userData?.role) {
            case 'field_rep':
              navigate('/fieldrep/dashboard');
              break;
            case 'vendor':
              navigate('/vendor/dashboard');
              break;
            case 'moderator':
              navigate('/moderator');
              break;
            default:
              navigate('/beta-nda');
          }

          toast({
            title: "Welcome to ClearMarket!",
            description: "Email verified successfully!",
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification.');
        toast({
          variant: "destructive",
          title: "Verification error",
          description: "Please try again or contact support.",
        });
      }
    };

    // Set up auth state listener to detect when session is established
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !isProcessed) {
        processVerification(session.user);
      }
    });

    // Also check for existing session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !isProcessed) {
        processVerification(session.user);
      }
    });

    // Check if there's an error in the URL (from Supabase auth)
    const checkUrlError = () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      if (error) {
        if (errorDescription?.includes('Email link is invalid') || errorDescription?.includes('expired')) {
          setStatus('error');
          setMessage('This verification link has expired or is invalid. Please request a new one.');
          toast({
            variant: "destructive",
            title: "Link Expired",
            description: "Please sign up again to receive a new verification email.",
            duration: 8000,
          });
        } else if (errorDescription?.includes('Email') && errorDescription?.includes('disabled')) {
          setStatus('error');
          setMessage('Email verification is currently disabled. Please contact support.');
          toast({
            variant: "destructive",
            title: "Service Configuration Issue",
            description: "Email authentication is not enabled. If you're the administrator, please enable email provider in Supabase.",
            duration: 10000,
          });
        } else {
          setStatus('error');
          setMessage(errorDescription || 'An authentication error occurred.');
        }
        
        setTimeout(() => navigate('/auth'), 5000);
        return true;
      }
      return false;
    };

    // Check for errors first
    if (checkUrlError()) {
      return;
    }

    // Set a timeout to show error if verification doesn't complete
    timeoutId = setTimeout(() => {
      if (!isProcessed) {
        setStatus('error');
        setMessage('Verification is taking longer than expected. The link may have expired.');
        setTimeout(() => navigate('/auth'), 3000);
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle>
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{message}</p>
          {status === 'error' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                You will be redirected to the sign-in page shortly.
              </p>
              <Button 
                onClick={() => navigate('/auth?tab=signup')}
                variant="outline"
                className="w-full"
              >
                Return to Sign Up
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerifyHandler;
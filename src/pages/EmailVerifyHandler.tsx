import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Email Verification Handler Page
 * 
 * This page handles email verification tokens from Supabase auth emails.
 * It processes the verification and redirects users to the appropriate page
 * based on their authentication status and NDA signing status.
 */
const EmailVerifyHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || type !== 'signup') {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        // The token verification is handled automatically by Supabase
        // We just need to check the user's authentication status
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setStatus('error');
          setMessage('Verification failed. Please try signing up again.');
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: "Please try signing up again.",
          });
          
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          return;
        }

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
          // Admin users bypass NDA
          toast({
            title: "Welcome back, Admin!",
            description: "Redirecting to your dashboard.",
          });
          navigate('/admin');
          return;
        }

        // For regular users, check NDA status (both nda_signatures AND users.nda_signed)
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

        const { data: ndaSignature, error: ndaError } = ndaSignatureResponse;
        const { data: userData, error: userDataError } = userDataResponse;

        if (ndaError) {
          console.error('Error checking NDA status:', ndaError);
        }

        if (userDataError) {
          console.error('Error fetching user data:', userDataError);
        }

        // Check if NDA process is complete (both signature exists AND users.nda_signed is true)
        const ndaCompleted = ndaSignature && userData?.nda_signed;

        // Redirect based on NDA completion status
        if (!ndaCompleted) {
          toast({
            title: "Welcome to ClearMarket!",
            description: "Please review and sign the beta agreement to continue.",
          });
          navigate('/beta-nda');
        } else {
          // User has completed NDA, redirect to appropriate dashboard
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
        
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

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
          <p className="text-muted-foreground">{message}</p>
          {status === 'error' && (
            <p className="text-sm text-muted-foreground mt-4">
              You will be redirected to the sign-in page shortly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerifyHandler;
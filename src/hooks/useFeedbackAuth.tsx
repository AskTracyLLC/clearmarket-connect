import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackUser {
  email: string;
  anonymousUsername: string;
  accessToken: string;
}

export const useFeedbackAuth = () => {
  const [user, setUser] = useState<FeedbackUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      validateToken(token);
    } else {
      // Check if user already has a valid session in localStorage
      const storedSession = localStorage.getItem('feedback_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          validateToken(session.accessToken);
        } catch {
          localStorage.removeItem('feedback_session');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      setIsLoading(true);
      
      // SECURITY: Enhanced token validation with proper error handling
      if (!token || token.length < 10) {
        toast({
          title: "Invalid Token",
          description: "Please use a valid access link.",
          variant: "destructive"
        });
        setUser(null);
        return;
      }
      
      // Validate token and get session info - temporarily using service role for validation
      const { data: session, error } = await supabase
        .from('feedback_sessions')
        .select('*')
        .eq('access_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        toast({
          title: "Invalid or Expired Link",
          description: "Your feedback access link has expired. Please request a new one.",
          variant: "destructive"
        });
        setUser(null);
        localStorage.removeItem('feedback_session');
        return;
      }

      // Update last accessed time
      await supabase
        .from('feedback_sessions')
        .update({ last_accessed: new Date().toISOString() })
        .eq('access_token', token);

      const feedbackUser = {
        email: session.user_email,
        anonymousUsername: session.anonymous_username,
        accessToken: token
      };

      setUser(feedbackUser);
      
      // Store session in localStorage for future visits
      localStorage.setItem('feedback_session', JSON.stringify(feedbackUser));
      
      toast({
        title: "Welcome to the Feedback Group!",
        description: `You're now logged in as ${session.anonymous_username}`
      });
      
    } catch (error) {
      console.error('Error validating feedback token:', error);
      toast({
        title: "Authentication Error",
        description: "There was a problem accessing the feedback group.",
        variant: "destructive"
      });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('feedback_session');
    toast({
      title: "Logged Out",
      description: "You've been logged out of the feedback group."
    });
  };

  return {
    user,
    isLoading,
    logout,
    isAuthenticated: !!user
  };
};
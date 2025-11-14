import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Post-auth redirect logic (deferred to avoid deadlocks)
    const handlePostAuthRedirect = async (eventType: string | null, currentSession: Session | null) => {
      const pathname = window.location.pathname;
      
      // CRITICAL: Never redirect from reset-password page - it must be completely isolated
      if (pathname === '/reset-password') {
        return;
      }
      
      if (!currentSession?.user) return;
      const user = currentSession.user;
      const isVerified = !!user.email_confirmed_at;

      // If on auth page, do not force redirect; let route protection handle NDA/verification
      if (pathname.startsWith('/auth')) {
        return;
      }

      // Check if user is admin - admins bypass all redirects
      try {
        const { data: isAdminData } = await supabase.rpc('is_admin_user', { user_id_param: user.id });
        const isAdmin = isAdminData === true || (typeof isAdminData === 'object' && isAdminData !== null && (isAdminData as Record<string, unknown>)['is_admin'] === true);
        if (isAdmin) {
          // Redirect admins away from the auth page
          if (window.location.pathname === '/auth') {
            window.location.href = '/admin-auth';
            return;
          }
          return;
        }
      } catch (error) {
        // silently ignore admin check errors
      }

      // Define public routes that should not trigger redirects
      const publicRoutes = ['/', '/reset-password', '/admin-auth', '/terms', '/privacy', '/refund-policy', '/contact', '/faq', '/feedback', '/verify-email', '/payment-success', '/beta-register', '/nda', '/beta-nda'];
      // reuse pathname declared above
      const isOnPublicRoute = publicRoutes.includes(pathname);

      // Special handling for prelaunch - authenticated users should be redirected away from it
      if (pathname === '/prelaunch') {
        if (isVerified) {
          window.location.href = '/nda';
        } else {
          window.location.href = '/verify-email';
        }
        return;
      }

      // Don't redirect if on a public route
      if (isOnPublicRoute) return;

      // If not verified and not already on verification page, redirect
      if (!isVerified && !pathname.includes('verify-email')) {
        window.location.href = '/verify-email';
      }
      // Don't force verified users to /nda - let protected routes handle their own NDA checks
    };

    // Set up auth state listener FIRST (synchronous callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update last_active when user authenticates
      if (session?.user && event === 'SIGNED_IN') {
        (async () => {
          try {
            await supabase.rpc('update_my_last_active');
            console.log('Last active updated');
          } catch (err) {
            console.error('Failed to update last active:', err);
          }
        })();
      }

      // Defer any Supabase calls/redirects to avoid deadlocks
      setTimeout(() => {
        handlePostAuthRedirect(event, session);
      }, 0);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        // Update last_active for existing session
        (async () => {
          try {
            await supabase.rpc('update_my_last_active');
            console.log('Last active updated');
          } catch (err) {
            console.error('Failed to update last active:', err);
          }
        })();
        
        // Defer to avoid any potential deadlocks
        setTimeout(() => {
          handlePostAuthRedirect(null, session);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    // Normalize input and detect email vs username
    const input = emailOrUsername.trim();
    const isEmail = input.includes('@');
    let email = input;

    // If it's a username, look up the email using secure function
    if (!isEmail) {
      const { data: lookupEmail, error: lookupError } = await supabase
        .rpc('lookup_email_by_username', { username_input: input });

      if (lookupError) {
        console.error('Username lookup error:', lookupError);
        return { error: { message: 'Unable to verify username. Please try again.' } };
      }
      if (!lookupEmail) {
        return { error: { message: 'Username not found' } };
      }
      email = lookupEmail;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/auth/verify`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      // Use custom password reset function with professional email template
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Password reset exception:', error);
      return { error: { message: error.message } };
    }
  };

  const isEmailVerified = user?.email_confirmed_at !== null;

  const value = {
    user,
    session,
    loading,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle post-authentication redirects
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const isVerified = !!user.email_confirmed_at;
          
          // Check if user is admin - admins bypass all redirects
          try {
            const { data: isAdmin } = await supabase
              .rpc('is_admin_user', { user_id_param: user.id });
            
            if (isAdmin) {
              console.log('✅ AuthContext: User is admin - bypassing all redirects');
              return;
            }
          } catch (error) {
            console.error('Error checking admin role:', error);
          }
          
          // Define public routes that should not trigger redirects
          const publicRoutes = ['/', '/auth', '/admin-auth', '/terms', '/privacy', '/refund-policy', '/contact', '/faq', '/feedback', '/verify-email', '/payment-success', '/beta-register', '/nda', '/beta-nda'];
          const isOnPublicRoute = publicRoutes.includes(window.location.pathname);
          
          // Special handling for prelaunch - authenticated users should be redirected away from it
          if (window.location.pathname === '/prelaunch') {
            console.log('🔍 AuthContext (SIGNED_IN): Authenticated user on prelaunch page, checking redirect');
            if (isVerified) {
              console.log('📍 AuthContext (SIGNED_IN): Redirecting verified user from prelaunch to NDA page');
              window.location.href = '/nda';
              return;
            } else {
              console.log('📍 AuthContext (SIGNED_IN): Redirecting unverified user from prelaunch to verify email');
              window.location.href = '/verify-email';
              return;
            }
          }
          
          // Don't redirect if on a public route
          if (isOnPublicRoute) {
            return;
          }
          
          // If not verified and not already on verification page, redirect
          if (!isVerified && !window.location.pathname.includes('verify-email')) {
            window.location.href = '/verify-email';
          } else if (isVerified && !window.location.pathname.includes('nda')) {
            // Only redirect to NDA if verified and not already on NDA page
            window.location.href = '/nda';
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle existing session redirects (same logic as SIGNED_IN event)
      if (session?.user) {
        const user = session.user;
        const isVerified = !!user.email_confirmed_at;
        
        // Check if user is admin - admins bypass all redirects
        try {
          const { data: isAdmin } = await supabase
            .rpc('is_admin_user', { user_id_param: user.id });
          
          if (isAdmin) {
            console.log('✅ AuthContext (existing session): User is admin - bypassing all redirects');
            return;
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
        }
        
        // Define public routes that should not trigger redirects
        const publicRoutes = ['/', '/auth', '/admin-auth', '/terms', '/privacy', '/refund-policy', '/contact', '/faq', '/feedback', '/verify-email', '/payment-success', '/beta-register', '/nda', '/beta-nda'];
        const isOnPublicRoute = publicRoutes.includes(window.location.pathname);
        
        // Special handling for prelaunch - authenticated users should be redirected away from it
        if (window.location.pathname === '/prelaunch') {
          console.log('🔍 AuthContext: Authenticated user on prelaunch page, checking redirect');
          if (isVerified) {
            console.log('📍 AuthContext: Redirecting verified user from prelaunch to NDA page');
            window.location.href = '/nda';
            return;
          } else {
            console.log('📍 AuthContext: Redirecting unverified user from prelaunch to verify email');
            window.location.href = '/verify-email';
            return;
          }
        }
        
        // Don't redirect if on a public route
        if (isOnPublicRoute) {
          return;
        }
        
        // If not verified and not already on verification page, redirect
        if (!isVerified && !window.location.pathname.includes('verify-email')) {
          window.location.href = '/verify-email';
        } else if (isVerified && !window.location.pathname.includes('nda')) {
          // Only redirect to NDA if verified and not already on NDA page
          window.location.href = '/nda';
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/nda`;
    
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

  const isEmailVerified = user?.email_confirmed_at !== null;

  const value = {
    user,
    session,
    loading,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

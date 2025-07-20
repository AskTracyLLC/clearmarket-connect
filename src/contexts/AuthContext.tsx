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
          const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app', 'tracy@asktracyllc.com'];
          console.log('🔍 AuthContext: Checking admin status for user:', user.email);
          if (adminEmails.includes(user.email || '')) {
            console.log('✅ AuthContext: User is admin by email - bypassing all redirects');
            // Admin users bypass all redirects
            return;
          }
          
          try {
            const { data: userRole, error } = await supabase
              .rpc('get_user_role', { user_id: user.id });
            
            if (userRole === 'admin') {
              // Admin users bypass all redirects
              return;
            }
          } catch (error) {
            console.error('Error checking user role:', error);
            // If role check fails for admin emails, still bypass redirects
            if (adminEmails.includes(user.email || '')) {
              return;
            }
          }
          
          // Define public routes that should not trigger redirects
          const publicRoutes = ['/', '/prelaunch', '/auth', '/admin-auth', '/terms', '/privacy', '/refund-policy', '/contact', '/faq', '/feedback', '/verify-email', '/payment-success'];
          const isOnPublicRoute = publicRoutes.includes(window.location.pathname);
          
          // Don't redirect if on a public route
          if (isOnPublicRoute) {
            return;
          }
          
          // If not verified and not already on verification page, redirect
          if (!isVerified && !window.location.pathname.includes('verify-email')) {
            window.location.href = '/verify-email';
          } else if (isVerified && !window.location.pathname.includes('beta-nda')) {
            // Only redirect to NDA if verified and not already on NDA page
            window.location.href = '/beta-nda';
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle existing session redirects (same logic as SIGNED_IN event)
      if (session?.user) {
        const user = session.user;
        const isVerified = !!user.email_confirmed_at;
        
        // Check if user is admin - admins bypass all redirects
        const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app', 'tracy@asktracyllc.com'];
        console.log('🔍 AuthContext (existing session): Checking admin status for user:', user.email);
        if (adminEmails.includes(user.email || '')) {
          console.log('✅ AuthContext (existing session): User is admin by email - bypassing all redirects');
          // Admin users bypass all redirects - RETURN EARLY to prevent any redirects
          return;
        }
        
        // Define public routes that should not trigger redirects
        const publicRoutes = ['/', '/prelaunch', '/auth', '/admin-auth', '/terms', '/privacy', '/refund-policy', '/contact', '/faq', '/feedback', '/verify-email', '/payment-success'];
        const isOnPublicRoute = publicRoutes.includes(window.location.pathname);
        
        // Don't redirect if on a public route
        if (isOnPublicRoute) {
          return;
        }
        
        // If not verified and not already on verification page, redirect
        if (!isVerified && !window.location.pathname.includes('verify-email')) {
          window.location.href = '/verify-email';
        } else if (isVerified && !window.location.pathname.includes('beta-nda')) {
          // Only redirect to NDA if verified and not already on NDA page
          window.location.href = '/beta-nda';
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
    const redirectUrl = `${window.location.origin}/beta-nda`;
    
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

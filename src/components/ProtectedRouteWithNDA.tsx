import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireNDA } from '@/hooks/useRequireNDA';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteWithNDAProps {
  children: React.ReactNode;
}

const ProtectedRouteWithNDA: React.FC<ProtectedRouteWithNDAProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasSignedNDA, loading: ndaLoading } = useRequireNDA();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check if user is admin - simplified for faster loading
  useEffect(() => {
    console.log('🔍 ProtectedRouteWithNDA - Starting admin check...');
    
    if (!user) {
      console.log('❌ No user found');
      setIsAdmin(false);
      return;
    }

    // Check if email is admin email (fast check, no database call needed)
    const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app', 'tracy@asktracyllc.com'];
    if (adminEmails.includes(user.email || '')) {
      console.log('✅ User is admin by email:', user.email, '- setting immediately');
      setIsAdmin(true);
      return;
    }

    // For non-admin emails, set to false immediately (no database call needed)
    console.log('❌ User is not admin by email, setting to false');
    setIsAdmin(false);
  }, [user?.id, user?.email]);

  console.log('🔍 ProtectedRouteWithNDA render - authLoading:', authLoading, 'ndaLoading:', ndaLoading, 'isAdmin:', isAdmin, 'hasSignedNDA:', hasSignedNDA);

  // Show loading state while checking auth, NDA status, and admin status
  if (authLoading || ndaLoading || isAdmin === null) {
    console.log('⏳ Showing loading state...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground text-sm">
            Verifying your access permissions
          </p>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ User not authenticated, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Admin users bypass all restrictions
  if (isAdmin) {
    console.log('✅ Admin user detected, bypassing all restrictions');
    return <>{children}</>;
  }

  // Redirect to NDA if not signed (handled by useRequireNDA hook)
  if (!hasSignedNDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
        <Card className="p-8 max-w-lg mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Legal Agreement Required</h2>
          <p className="text-muted-foreground mb-4">
            You must complete the Beta Tester Non-Disclosure Agreement before accessing ClearMarket.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to agreement page...
          </p>
        </Card>
      </div>
    );
  }

  // User is authenticated and has signed NDA - render protected content
  return <>{children}</>;
};

export default ProtectedRouteWithNDA;
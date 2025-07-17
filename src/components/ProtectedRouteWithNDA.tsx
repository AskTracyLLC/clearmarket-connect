import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireNDA } from '@/hooks/useRequireNDA';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isAdminByEmail } from '@/utils/adminCheck';

interface ProtectedRouteWithNDAProps {
  children: React.ReactNode;
}

const ProtectedRouteWithNDA: React.FC<ProtectedRouteWithNDAProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  
  // Immediate admin check by email - no async delay
  const isAdminEmail = user ? isAdminByEmail(user.email) : false;
  
  // Always call NDA hook but it will be optimized internally for admin users
  const { hasSignedNDA, loading: ndaLoading } = useRequireNDA();
  
  const [isAdminByRole, setIsAdminByRole] = useState<boolean | null>(null);

  // Check if user is admin by database role (fallback for non-email admin users)
  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('🔍 ProtectedRouteWithNDA - Starting database role check...');
      
      if (!user) {
        console.log('❌ No user found');
        setIsAdminByRole(false);
        return;
      }

      // Skip database check if already admin by email
      if (isAdminEmail) {
        console.log('✅ User is admin by email, skipping database check:', user.email);
        setIsAdminByRole(true);
        return;
      }

      // Debug logging
      console.log('🔍 Checking database role for user:', user.id, user.email);

      try {
        const { data: userRole, error } = await supabase
          .rpc('get_user_role', { user_id: user.id });
        
        console.log('🔍 User role from database:', userRole, 'Error:', error);
        
        if (error) {
          console.error('❌ Error checking user role:', error);
          setIsAdminByRole(false);
        } else {
          const isAdminRole = userRole === 'admin';
          console.log('🔍 Is admin role?', isAdminRole);
          setIsAdminByRole(isAdminRole);
        }
      } catch (error) {
        console.error('❌ Error in admin check:', error);
        setIsAdminByRole(false);
      }
    };

    checkAdminRole();
  }, [user?.id, user?.email, isAdminEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine final admin status
  const isAdmin = isAdminEmail || isAdminByRole;

  console.log('🔍 ProtectedRouteWithNDA render - authLoading:', authLoading, 'ndaLoading:', ndaLoading, 'isAdminEmail:', isAdminEmail, 'isAdminByRole:', isAdminByRole, 'hasSignedNDA:', hasSignedNDA);

  // Admin users with email bypass all loading states and checks
  if (isAdminEmail) {
    console.log('✅ Admin user detected by email, bypassing all restrictions');
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ User not authenticated, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Show loading state while checking auth, NDA status, and admin role (only for non-admin emails)
  if (authLoading || ndaLoading || isAdminByRole === null) {
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
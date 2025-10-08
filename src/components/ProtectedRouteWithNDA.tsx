
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireNDA } from '@/hooks/useRequireNDA';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteWithNDAProps {
  children: React.ReactNode;
}

const ProtectedRouteWithNDA: React.FC<ProtectedRouteWithNDAProps> = ({ children }) => {
  console.log('🔍 ProtectedRouteWithNDA - Component rendered for path:', window.location.pathname);
  const { user, loading: authLoading } = useAuth();
  const { hasSignedNDA, loading: ndaLoading, userNdaSigned } = useRequireNDA();
  const { profile, loading: profileLoading } = useUserProfile();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [hasPersonalInfo, setHasPersonalInfo] = useState<boolean | null>(null);

  // Check if user is admin using secure database role check
  useEffect(() => {
    const checkAdmin = async () => {
      console.log('🔍 ProtectedRouteWithNDA - Starting admin check...');
      
      if (!user) {
        console.log('❌ No user found');
        setIsAdmin(false);
        return;
      }

      try {
        const { data: isAdminUser } = await supabase
          .rpc('is_admin_user', { user_id_param: user.id });
        
        console.log(isAdminUser ? '✅ User is admin' : '❌ User is not admin');
        setIsAdmin(isAdminUser || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.id]);

  // Check if personal info is complete for field reps
  useEffect(() => {
    const checkPersonalInfo = async () => {
      if (!user || profile?.role !== 'field_rep') {
        setHasPersonalInfo(true); // Not a field rep, so not applicable
        return;
      }
      
      try {
        const { data } = await supabase
          .from('field_rep_profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const isComplete = !!(data?.first_name && data?.last_name);
        console.log('🔍 Personal Info complete:', isComplete, data);
        setHasPersonalInfo(isComplete);
      } catch (error) {
        console.error('Error checking personal info:', error);
        setHasPersonalInfo(false);
      }
    };
    
    if (!authLoading && !profileLoading) {
      checkPersonalInfo();
    }
  }, [user?.id, profile?.role, authLoading, profileLoading]);

  console.log('🔍 ProtectedRouteWithNDA render - authLoading:', authLoading, 'ndaLoading:', ndaLoading, 'profileLoading:', profileLoading, 'isAdmin:', isAdmin, 'hasPersonalInfo:', hasPersonalInfo, 'hasSignedNDA:', hasSignedNDA, 'userNdaSigned:', userNdaSigned, 'profile:', profile);

  // Show loading state while checking auth, NDA status, profile, admin status, and personal info
  if (authLoading || ndaLoading || profileLoading || isAdmin === null || hasPersonalInfo === null) {
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

  // Field Rep specific routing logic
  if (profile?.role === 'field_rep') {
    console.log('🔍 Field Rep detected, checking NDA and personal info...');
    
    // If NDA not signed, redirect to NDA page
    if (!userNdaSigned) {
      console.log('❌ Field Rep has not signed NDA, redirecting to NDA page. userNdaSigned:', userNdaSigned);
      return <Navigate to="/beta-nda" state={{ from: location.pathname }} replace />;
    }
    
    // If NDA signed but personal info incomplete, redirect to profile page (but not if already there)
    if (userNdaSigned && !hasPersonalInfo) {
      // Only redirect if not already on the profile page (prevent redirect loop)
      if (location.pathname !== '/fieldrep/profile') {
        console.log('❌ Field Rep personal info incomplete, redirecting to profile page');
        return <Navigate to="/fieldrep/profile" state={{ from: location.pathname }} replace />;
      }
      // If already on profile page, allow access so they can complete it
      console.log('✅ Already on profile page, allowing access to complete profile');
      return <>{children}</>;
    }
    
    console.log('✅ Field Rep NDA signed and personal info complete, allowing access');
    return <>{children}</>;
  }

  // For non-Field Rep users, check NDA requirement
  if (!userNdaSigned) {
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

  // User is authenticated and has signed NDA (or is Field Rep with complete profile) - render protected content
  return <>{children}</>;
};

export default ProtectedRouteWithNDA;

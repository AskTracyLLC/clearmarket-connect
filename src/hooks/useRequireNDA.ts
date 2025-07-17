import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNDAStatus } from './useNDAStatus';
import { supabase } from '@/integrations/supabase/client';

// Pages that don't require NDA (public pages)
const PUBLIC_ROUTES = [
  '/',
  '/prelaunch',
  '/auth',
  '/admin-auth',
  '/terms',
  '/privacy',
  '/refund-policy',
  '/contact',
  '/faq',
  '/feedback',
  '/beta-nda',
  '/verify-email',
  '/payment-success'
];

export const useRequireNDA = () => {
  const { user } = useAuth();
  const { hasSignedNDA, loading } = useNDAStatus();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading or user is not authenticated
    if (loading || !user) return;

    console.log('🔍 useRequireNDA - Starting checks for user:', user.email, 'on path:', location.pathname);

    // Don't redirect if on a public route (check this FIRST before any other logic)
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      console.log('✅ On public route, no checks needed');
      return;
    }

    // Don't redirect if already on NDA page
    if (location.pathname === '/beta-nda') {
      console.log('✅ Already on NDA page');
      return;
    }

    // Check if user is admin - admins bypass all restrictions
    const checkAdminStatus = async () => {
      try {
        // Check if email is admin email (primary check - same as ProtectedRouteWithNDA)
        const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app'];
        if (adminEmails.includes(user.email || '')) {
          console.log('✅ User is admin by email:', user.email, '- bypassing all restrictions');
          return;
        }

        // Fallback: Check database role
        const { data: userRole, error } = await supabase
          .rpc('get_user_role', { user_id: user.id });
        
        if (error) {
          console.error('Error checking user role:', error);
        }
        
        // If user is admin by database role, don't redirect anywhere
        if (userRole === 'admin') {
          console.log('✅ User is admin by database role - bypassing all restrictions');
          return;
        }

        // Only redirect if user is on a protected route AND hasn't signed NDA
        if (!hasSignedNDA && !PUBLIC_ROUTES.includes(location.pathname)) {
          console.log('❌ User has not signed NDA, redirecting to NDA page');
          navigate('/beta-nda', { 
            replace: true,
            state: { from: location.pathname } 
          });
        } else {
          console.log('✅ User has signed NDA or on allowed route');
        }
      } catch (error) {
        console.error('Error in useRequireNDA:', error);
      }
    };

    checkAdminStatus();
  }, [user, hasSignedNDA, loading, location.pathname, navigate]);

  return {
    hasSignedNDA,
    loading,
    isProtectedRoute: !PUBLIC_ROUTES.includes(location.pathname)
  };
};
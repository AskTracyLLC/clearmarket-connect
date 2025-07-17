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

    // Check if user is admin - admins bypass all restrictions
    const checkAdminStatus = async () => {
      try {
        const { data: userRole, error } = await supabase
          .rpc('get_user_role', { user_id: user.id });
        
        if (error) {
          console.error('Error checking user role:', error);
        }
        
        // If user is admin, don't redirect anywhere
        if (userRole === 'admin') {
          return;
        }

        // Don't redirect if on a public route
        if (PUBLIC_ROUTES.includes(location.pathname)) return;

        // Don't redirect if already on NDA page
        if (location.pathname === '/beta-nda') return;

        // Only redirect if user is on a protected route AND hasn't signed NDA
        if (!hasSignedNDA && !PUBLIC_ROUTES.includes(location.pathname)) {
          console.log('Redirecting to NDA - user has not signed agreement');
          navigate('/beta-nda', { 
            replace: true,
            state: { from: location.pathname } 
          });
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
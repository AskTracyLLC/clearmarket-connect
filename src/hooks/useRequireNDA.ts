import { useEffect, useState } from 'react';
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
  '/nda',
  '/verify-email',
  '/payment-success'
];

export const useRequireNDA = () => {
  const { user } = useAuth();
  const { hasSignedNDA, loading } = useNDAStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [userNdaSigned, setUserNdaSigned] = useState<boolean | null>(null);

  // Check user's NDA status from users table (more reliable than nda_signatures table)
  useEffect(() => {
    const checkUserNDAStatus = async () => {
      if (!user) {
        setUserNdaSigned(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('nda_signed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking user NDA status:', error);
          setUserNdaSigned(false);
        } else {
          setUserNdaSigned(data?.nda_signed || false);
        }
      } catch (error) {
        console.error('Error in checkUserNDAStatus:', error);
        setUserNdaSigned(false);
      }
    };

    checkUserNDAStatus();
  }, [user]);

  useEffect(() => {
    // Don't redirect if still loading or user is not authenticated
    if (loading || !user) return;

    // Don't redirect if on a public route (check this FIRST before any other logic)
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      return;
    }

    // Don't redirect if already on NDA page
    if (location.pathname === '/beta-nda' || location.pathname === '/nda') {
      return;
    }

    // Check if user is admin - admins bypass all restrictions
    const checkAdminStatus = async () => {
      try {
        const { data: isAdmin } = await supabase
          .rpc('is_admin_user', { user_id_param: user.id });
        
        if (isAdmin) {
          return;
        }

        // Primary check: use userNdaSigned from users table (most reliable)
        // hasSignedNDA is secondary and may have timing issues
        const ndaCompleted = userNdaSigned === true;
        
        // Only redirect if user is on a protected route AND hasn't completed NDA process
        if (!ndaCompleted && !PUBLIC_ROUTES.includes(location.pathname)) {
          navigate('/beta-nda', { 
            replace: true,
            state: { from: location.pathname } 
          });
        }
      } catch (error) {
        console.error('Error in useRequireNDA:', error);
      }
    };

    // Only check if we have userNdaSigned status (not null)
    if (userNdaSigned !== null) {
      checkAdminStatus();
    }
  }, [user, userNdaSigned, loading, location.pathname, navigate]);

  return {
    hasSignedNDA: userNdaSigned === true, // Use users table as source of truth
    loading: loading || (user && userNdaSigned === null),
    isProtectedRoute: !PUBLIC_ROUTES.includes(location.pathname),
    userNdaSigned
  };
};

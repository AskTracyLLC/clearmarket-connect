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
    if (loading || !user || userNdaSigned === null) return;

    console.log('🔍 useRequireNDA - Starting checks for user:', user.email, 'on path:', location.pathname, 'NDA signed:', userNdaSigned);

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
        const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app', 'tracy@asktracyllc.com'];
        console.log('🔍 useRequireNDA: Checking admin status for user:', user.email);
        if (adminEmails.includes(user.email || '')) {
          console.log('✅ useRequireNDA: User is admin by email:', user.email, '- bypassing all restrictions');
          return;
        }

        // Fallback: Check database role
        const { data: userRole, error } = await supabase
          .rpc('get_user_role', { user_id: user.id });
        
        if (error) {
          console.error('Error checking user role:', error);
          // If role check fails for admin emails, still bypass restrictions
          if (adminEmails.includes(user.email || '')) {
            console.log('✅ Admin email detected despite role check error - bypassing restrictions');
            return;
          }
        }
        
        // If user is admin by database role, don't redirect anywhere
        if (userRole === 'admin') {
          console.log('✅ User is admin by database role - bypassing all restrictions');
          return;
        }

        // Check both hasSignedNDA (from nda_signatures table) AND userNdaSigned (from users table)
        const ndaCompleted = hasSignedNDA && userNdaSigned;
        
        // Only redirect if user is on a protected route AND hasn't completed NDA process
        if (!ndaCompleted && !PUBLIC_ROUTES.includes(location.pathname)) {
          console.log('❌ User has not completed NDA process, redirecting to NDA page. hasSignedNDA:', hasSignedNDA, 'userNdaSigned:', userNdaSigned);
          navigate('/beta-nda', { 
            replace: true,
            state: { from: location.pathname } 
          });
        } else {
          console.log('✅ User has completed NDA process or on allowed route');
        }
      } catch (error) {
        console.error('Error in useRequireNDA:', error);
        // If anything fails for admin emails, still bypass restrictions
        const adminEmails = ['admin@clearmarket.com', 'admin@lovable.app', 'tracy@asktracyllc.com'];
        if (adminEmails.includes(user.email || '')) {
          console.log('✅ Admin email detected despite error - bypassing restrictions');
          return;
        }
      }
    };

    checkAdminStatus();
  }, [user, hasSignedNDA, userNdaSigned, loading, location.pathname, navigate]);

  return {
    hasSignedNDA: hasSignedNDA && userNdaSigned, // Both must be true
    loading: loading || userNdaSigned === null,
    isProtectedRoute: !PUBLIC_ROUTES.includes(location.pathname),
    userNdaSigned
  };
};

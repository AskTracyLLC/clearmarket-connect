import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminRole } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

export interface SecureAuthState {
  isAdmin: boolean;
  isModerator: boolean;
  isLoading: boolean;
  userRole: string | null;
  checkingRole: boolean;
}

/**
 * Secure authentication hook with role-based access control
 * Replaces hardcoded admin email checks with database-driven role verification
 */
export const useSecureAuth = (): SecureAuthState => {
  const { user } = useAuth();
  const [authState, setAuthState] = useState<SecureAuthState>({
    isAdmin: false,
    isModerator: false,
    isLoading: true,
    userRole: null,
    checkingRole: true,
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setAuthState({
          isAdmin: false,
          isModerator: false,
          isLoading: false,
          userRole: null,
          checkingRole: false,
        });
        return;
      }

      setAuthState(prev => ({ ...prev, checkingRole: true }));

      try {
        // Use secure database function instead of hardcoded emails
        const [isAdminResult, userProfile] = await Promise.all([
          checkAdminRole(user.id),
          supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        ]);

        const userRole = userProfile.data?.role || null;

        setAuthState({
          isAdmin: isAdminResult,
          isModerator: userRole === 'moderator' || isAdminResult,
          isLoading: false,
          userRole,
          checkingRole: false,
        });
      } catch (error) {
        console.error('Error checking user role:', error);
        setAuthState({
          isAdmin: false,
          isModerator: false,
          isLoading: false,
          userRole: null,
          checkingRole: false,
        });
      }
    };

    checkUserRole();
  }, [user]);

  return authState;
};

/**
 * Hook for secure rate limiting with server-side validation
 */
export const useSecureRateLimit = (operation: string, maxAttempts: number = 5) => {
  const { user } = useAuth();
  const [isLimited, setIsLimited] = useState(false);
  
  const checkRateLimit = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        user_id_param: user.id,
        operation_type: operation,
        max_attempts: maxAttempts,
        window_minutes: 60
      });
      
      const canProceed = !error && data === true;
      setIsLimited(!canProceed);
      return canProceed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      setIsLimited(true);
      return false;
    }
  };
  
  return { isLimited, checkRateLimit };
};
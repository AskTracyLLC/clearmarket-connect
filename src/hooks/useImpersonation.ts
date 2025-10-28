import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ImpersonationState {
  isImpersonating: boolean;
  targetUserId: string | null;
  targetUserName: string | null;
  targetUserRole: string | null;
  adminId: string | null;
  isReadOnly: boolean;
  scopes: string[];
  sessionId: string | null;
  expiresAt: Date | null;
}

interface ImpersonationClaims {
  sub: string;
  act?: string;
  ro?: boolean;
  scope?: string;
  sid?: string;
  exp?: number;
}

export const useImpersonation = () => {
  const { session } = useAuth();
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    targetUserId: null,
    targetUserName: null,
    targetUserRole: null,
    adminId: null,
    isReadOnly: true,
    scopes: [],
    sessionId: null,
    expiresAt: null,
  });
  const [originalSession, setOriginalSession] = useState<any>(null);

  // Parse JWT claims
  const parseJwtClaims = useCallback((token: string): ImpersonationClaims | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }, []);

  // Check if current session is impersonation
  useEffect(() => {
    const checkImpersonation = async () => {
      if (!session?.access_token) {
        setState({
          isImpersonating: false,
          targetUserId: null,
          targetUserName: null,
          targetUserRole: null,
          adminId: null,
          isReadOnly: true,
          scopes: [],
          sessionId: null,
          expiresAt: null,
        });
        return;
      }

      const claims = parseJwtClaims(session.access_token);
      
      if (claims?.act && claims?.sid) {
        // This is an impersonation session
        const scopes = claims.scope ? claims.scope.split(' ') : [];
        
        // Fetch target user info
        const { data: targetUser } = await supabase
          .from('users')
          .select('display_name, anonymous_username, role')
          .eq('id', claims.sub)
          .single();

        setState({
          isImpersonating: true,
          targetUserId: claims.sub,
          targetUserName: targetUser?.display_name || targetUser?.anonymous_username || 'Unknown User',
          targetUserRole: targetUser?.role || null,
          adminId: claims.act,
          isReadOnly: claims.ro ?? true,
          scopes,
          sessionId: claims.sid,
          expiresAt: claims.exp ? new Date(claims.exp * 1000) : null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isImpersonating: false,
        }));
      }
    };

    checkImpersonation();
  }, [session, parseJwtClaims]);

  // Start impersonation
  const startImpersonation = useCallback(async (
    targetUserId: string,
    reason: string,
    readOnly: boolean = true,
    scopes: string[] = []
  ) => {
    try {
      // Store original session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setOriginalSession(currentSession);

      // Call edge function to start impersonation
      const { data, error } = await supabase.functions.invoke('admin-impersonate', {
        body: {
          target_user_id: targetUserId,
          read_only: readOnly,
          scopes,
          reason,
        },
      });

      if (error) throw error;

      // Set the impersonation session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: '', // Impersonation sessions don't have refresh tokens
      });

      if (sessionError) throw sessionError;

      toast({
        title: "Impersonation Started",
        description: `You are now viewing as the target user in ${readOnly ? 'read-only' : 'support'} mode.`,
      });

      return { success: true, sessionId: data.session_id };
    } catch (error: any) {
      console.error('Error starting impersonation:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to start impersonation',
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  }, []);

  // End impersonation
  const endImpersonation = useCallback(async () => {
    if (!state.sessionId || !originalSession) {
      toast({
        title: "Error",
        description: "No active impersonation session",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call edge function to end session
      const { error } = await supabase.functions.invoke('admin-impersonate-end', {
        body: { session_id: state.sessionId },
      });

      if (error) throw error;

      // Restore original session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: originalSession.access_token,
        refresh_token: originalSession.refresh_token,
      });

      if (sessionError) throw sessionError;

      setOriginalSession(null);
      
      toast({
        title: "Impersonation Ended",
        description: "You have returned to your admin session.",
      });

      // Reload to clear any cached state
      window.location.reload();
    } catch (error: any) {
      console.error('Error ending impersonation:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to end impersonation',
        variant: "destructive",
      });
    }
  }, [state.sessionId, originalSession]);

  // Check if user can perform an action
  const canPerformAction = useCallback((action: string): boolean => {
    if (!state.isImpersonating) return true;
    if (state.isReadOnly) return false;
    return state.scopes.includes(action);
  }, [state]);

  return {
    ...state,
    startImpersonation,
    endImpersonation,
    canPerformAction,
  };
};

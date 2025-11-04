import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NDASignature {
  id: string;
  signature_name: string;
  signed_date: string;
  signature_version: string;
  is_active: boolean;
}

export const useNDAStatus = () => {
  const { user } = useAuth();
  const [hasSignedNDA, setHasSignedNDA] = useState<boolean>(false);
  const [ndaSignature, setNdaSignature] = useState<NDASignature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkNDAStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('nda_signatures')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (queryError) throw queryError;

      setHasSignedNDA(!!data);
      setNdaSignature(data);
      setError(null);
    } catch (err) {
      console.error('Error checking NDA status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check NDA status');
      setHasSignedNDA(false);
    } finally {
      setLoading(false);
    }
  };

  const signNDA = async (signatureName: string, firstName?: string, lastName?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to sign NDA');
    }

    try {
      // Log NDA attempt
      await supabase.rpc('log_nda_attempt', {
        target_user_id: user.id,
        attempt_status: 'attempt',
        additional_metadata: {
          signature_name: signatureName,
          first_name: firstName,
          last_name: lastName,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      const { data, error: insertError } = await supabase
        .from('nda_signatures')
        .insert({
          user_id: user.id,
          signature_name: signatureName,
          first_name: firstName,
          last_name: lastName,
          signature_version: 'v1'
        })
        .select()
        .single();

      if (insertError) {
        // Log failed NDA signature
        await supabase.rpc('log_nda_attempt', {
          target_user_id: user.id,
          attempt_status: 'fail',
          error_msg: insertError.message,
          additional_metadata: {
            signature_name: signatureName,
            error_code: insertError.code,
            error_details: insertError.details
          }
        });
        throw insertError;
      }

      setHasSignedNDA(true);
      setNdaSignature(data);
      return data;
    } catch (err) {
      console.error('Error signing NDA:', err);
      
      // Log any unexpected errors
      if (err instanceof Error) {
        await supabase.rpc('log_nda_attempt', {
          target_user_id: user.id,
          attempt_status: 'fail',
          error_msg: err.message,
          additional_metadata: {
            signature_name: signatureName,
            error_type: 'unexpected_error'
          }
        });
      }
      
      throw err;
    }
  };

  useEffect(() => {
    checkNDAStatus();
  }, [user?.id]);

  return {
    hasSignedNDA,
    ndaSignature,
    loading,
    error,
    signNDA,
    refetch: checkNDAStatus
  };
};
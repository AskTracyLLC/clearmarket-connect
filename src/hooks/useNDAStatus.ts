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

  const signNDA = async (signatureName: string) => {
    if (!user) {
      throw new Error('User must be authenticated to sign NDA');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('nda_signatures')
        .insert({
          user_id: user.id,
          signature_name: signatureName,
          signature_version: 'v1'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setHasSignedNDA(true);
      setNdaSignature(data);
      return data;
    } catch (err) {
      console.error('Error signing NDA:', err);
      throw err;
    }
  };

  useEffect(() => {
    checkNDAStatus();
  }, [user]);

  return {
    hasSignedNDA,
    ndaSignature,
    loading,
    error,
    signNDA,
    refetch: checkNDAStatus
  };
};
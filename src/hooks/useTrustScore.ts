import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrustScore {
  user_id: string;
  user_role: 'field_rep' | 'vendor';
  communication_score: number;
  on_time_performance_score?: number;
  quality_of_work_score?: number;
  paid_on_time_score?: number;
  provided_what_needed_score?: number;
  overall_trust_score: number;
  badge_level: string;
  total_reviews: number;
  last_review_date?: string;
}

export interface TrustScoreReview {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  job_number: string;
  platform_system: string;
  completion_date: string;
  review_type: 'field_rep' | 'vendor';
  communication_score: number;
  on_time_performance_score?: number;
  quality_of_work_score?: number;
  paid_on_time_score?: number;
  provided_what_needed_score?: number;
  review_text?: string;
  attachments?: string[];
  is_negative: boolean;
  is_disputed: boolean;
  dispute_status: string;
  is_hidden: boolean;
  hidden_until?: string;
  hidden_by_credits: boolean;
  is_featured: boolean;
  created_at: string;
}

export const useTrustScore = (userId?: string) => {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [reviews, setReviews] = useState<TrustScoreReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const targetUserId = userId || user?.id;

  const fetchTrustScore = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('trust_scores')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setTrustScore(data as TrustScore);
    } catch (err: any) {
      console.error('Error fetching trust score:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('trust_score_reviews')
        .select('*')
        .eq('reviewed_user_id', targetUserId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as TrustScoreReview[]) || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    }
  };

  const canSubmitReview = async (revieweeId: string): Promise<boolean> => {
    if (!user?.id || user.id === revieweeId) return false;
    
    try {
      const { data, error } = await supabase.rpc('can_submit_review', {
        reviewer_user_id: user.id,
        target_user_id: revieweeId
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      return false;
    }
  };

  const hideReviewWithCredits = async (reviewId: string, days: number = 30): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase.rpc('hide_review_with_credits', {
        review_id: reviewId,
        hide_days: days
      });

      if (error) throw error;
      
      if (data) {
        // Refresh reviews after hiding
        await fetchReviews();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error hiding review with credits:', err);
      return false;
    }
  };

  const disputeReview = async (reviewId: string, reason: string, attachments?: string[]): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('trust_score_reviews')
        .update({
          is_disputed: true,
          dispute_reason: reason,
          dispute_attachments: attachments,
          dispute_status: 'pending'
        })
        .eq('id', reviewId)
        .eq('reviewed_user_id', user.id);

      if (error) throw error;
      
      // Refresh reviews after disputing
      await fetchReviews();
      return true;
    } catch (err) {
      console.error('Error disputing review:', err);
      return false;
    }
  };

  const featureReview = async (reviewId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // First spend ClearCredits
      const { data: spendSuccess } = await supabase.rpc('spend_clear_credits', {
        spender_user_id: user.id,
        amount_param: 1,
        reference_id_param: reviewId,
        reference_type_param: 'feature_review'
      });

      if (!spendSuccess) return false;

      // Then feature the review
      const { error } = await supabase
        .from('trust_score_reviews')
        .update({ is_featured: true })
        .eq('id', reviewId)
        .eq('reviewed_user_id', user.id);

      if (error) throw error;
      
      // Refresh reviews after featuring
      await fetchReviews();
      return true;
    } catch (err) {
      console.error('Error featuring review:', err);
      return false;
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchTrustScore();
      fetchReviews();
    }
  }, [targetUserId]);

  return {
    trustScore,
    reviews,
    loading,
    error,
    refetch: () => {
      fetchTrustScore();
      fetchReviews();
    },
    canSubmitReview,
    hideReviewWithCredits,
    disputeReview,
    featureReview
  };
};
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRepPoints = () => {
  const { user } = useAuth();
  const [isAwarding, setIsAwarding] = useState(false);

  const awardRepPoints = async (
    targetUserId: string,
    points: number,
    ruleName: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: any
  ) => {
    if (!user) return false;

    setIsAwarding(true);
    try {
      const { data, error } = await supabase.rpc('award_rep_points', {
        target_user_id: targetUserId,
        points_amount: points,
        rule_name_param: ruleName,
        reference_id_param: referenceId,
        reference_type_param: referenceType,
        metadata_param: metadata
      });

      if (error) {
        console.error('Error awarding rep points:', error);
        toast.error('Failed to award Rep Points');
        return false;
      }

      if (data) {
        toast.success(`+${points} Rep Points awarded!`);
        return true;
      } else {
        toast.error('Rep Points not awarded (daily limit reached or other restriction)');
        return false;
      }
    } catch (error) {
      console.error('Error awarding rep points:', error);
      toast.error('Failed to award Rep Points');
      return false;
    } finally {
      setIsAwarding(false);
    }
  };

  // Helper functions for specific earning scenarios
  const awardHelpfulVote = (targetUserId: string, postId: string) => {
    return awardRepPoints(
      targetUserId,
      1,
      'helpful_vote_received',
      postId,
      'community_post',
      { action: 'helpful_vote' }
    );
  };

  const awardGivingHelpfulVote = (voterId: string, postId: string) => {
    return awardRepPoints(
      voterId,
      1,
      'helpful_vote_given',
      postId,
      'community_post',
      { action: 'gave_helpful_vote' }
    );
  };

  const awardProfileCompletion = (userId: string) => {
    return awardRepPoints(
      userId,
      5,
      'profile_completion',
      userId,
      'user_profile',
      { action: 'profile_complete' }
    );
  };

  const awardReview = (reviewerId: string, reviewId: string) => {
    return awardRepPoints(
      reviewerId,
      1,
      'verified_review',
      reviewId,
      'review',
      { action: 'left_review' }
    );
  };

  const awardTrustMilestone = (userId: string, trustScore: number) => {
    return awardRepPoints(
      userId,
      15,
      'trust_score_milestone',
      userId,
      'trust_score',
      { trust_score: trustScore }
    );
  };

  return {
    awardRepPoints,
    awardHelpfulVote,
    awardGivingHelpfulVote,
    awardProfileCompletion,
    awardReview,
    awardTrustMilestone,
    isAwarding
  };
};
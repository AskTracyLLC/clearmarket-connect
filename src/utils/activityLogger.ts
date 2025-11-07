import { supabase } from "@/integrations/supabase/client";

export interface LogActivityParams {
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export const logActivity = async ({
  action,
  targetTable,
  targetId,
  metadata
}: LogActivityParams) => {
  try {
    const { error } = await supabase
      .from('audit_log')
      .insert({
        action,
        target_table: targetTable,
        target_id: targetId,
        metadata: metadata || {}
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Specific logging functions for common activities
export const logUserActivity = {
  profileUpdate: (targetUserId: string, changes: Record<string, any>) =>
    logActivity({
      action: 'profile_update',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { changes }
    }),

  emailChange: (targetUserId: string, oldEmail: string, newEmail: string) =>
    logActivity({
      action: 'email_change',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { oldEmail, newEmail }
    }),

  passwordChange: (targetUserId: string) =>
    logActivity({
      action: 'password_change',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { timestamp: new Date().toISOString() }
    }),

  roleChange: (targetUserId: string, oldRole: string, newRole: string) =>
    logActivity({
      action: 'role_change',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { oldRole, newRole }
    }),

  trustScoreUpdate: (targetUserId: string, metadata: Record<string, any>) =>
    logActivity({
      action: 'trust_score_update',
      targetTable: 'users',
      targetId: targetUserId,
      metadata
    }),

  creditAdjustment: (targetUserId: string, metadata: Record<string, any>) =>
    logActivity({
      action: 'credit_adjustment',
      targetTable: 'credits',
      targetId: targetUserId,
      metadata
    }),

  coverageUpdate: (targetUserId: string, newCoverage: any) =>
    logActivity({
      action: 'coverage_update',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { newCoverage }
    }),

  postRemoved: (postId: string, reason: string, postData: any) =>
    logActivity({
      action: 'post_removed',
      targetTable: 'community_posts',
      targetId: postId,
      metadata: { reason, postData }
    }),

  userCreated: (targetUserId: string, userType: string) =>
    logActivity({
      action: 'user_created',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { userType, timestamp: new Date().toISOString() }
    }),

  firstLogin: (targetUserId: string) =>
    logActivity({
      action: 'first_login',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { timestamp: new Date().toISOString() }
    }),

  lastLogin: (targetUserId: string) =>
    logActivity({
      action: 'last_login',
      targetTable: 'users',
      targetId: targetUserId,
      metadata: { timestamp: new Date().toISOString() }
    }),

  reviewSubmitted: (reviewId: string, reviewerId: string, reviewedUserId: string) =>
    logActivity({
      action: 'review_submitted',
      targetTable: 'reviews',
      targetId: reviewId,
      metadata: { reviewerId, reviewedUserId }
    }),

  reviewReceived: (reviewId: string, reviewerId: string, reviewedUserId: string) =>
    logActivity({
      action: 'review_received',
      targetTable: 'reviews',
      targetId: reviewId,
      metadata: { reviewerId, reviewedUserId }
    })
};
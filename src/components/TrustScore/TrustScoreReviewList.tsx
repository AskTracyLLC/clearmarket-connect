import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Flag, Eye, EyeOff, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { TrustScoreReview } from "@/hooks/useTrustScore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TrustScoreReviewListProps {
  reviews: TrustScoreReview[];
  userRole: 'field_rep' | 'vendor';
  isOwnProfile?: boolean;
  onHideReview?: (reviewId: string) => Promise<boolean>;
  onDisputeReview?: (reviewId: string, reason: string) => Promise<boolean>;
  onFeatureReview?: (reviewId: string) => Promise<boolean>;
}

const TrustScoreReviewList: React.FC<TrustScoreReviewListProps> = ({
  reviews,
  userRole,
  isOwnProfile = false,
  onHideReview,
  onDisputeReview,
  onFeatureReview
}) => {
  const [disputingReviewId, setDisputingReviewId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const getScoreDisplay = (score: number) => {
    if (score === 2) return { text: "Great", color: "bg-green-100 text-green-800" };
    if (score === 0) return { text: "Meh", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Bad", color: "bg-red-100 text-red-800" };
  };

  const getCategoryLabels = () => {
    if (userRole === 'field_rep') {
      return {
        second: 'On-Time',
        third: 'Quality'
      };
    } else {
      return {
        second: 'Paid On-Time',
        third: 'Provided Needed'
      };
    }
  };

  const { second, third } = getCategoryLabels();

  const handleDispute = async (reviewId: string) => {
    if (!disputeReason.trim() || !onDisputeReview) return;
    
    const success = await onDisputeReview(reviewId, disputeReason);
    if (success) {
      toast({
        title: "Review Disputed",
        description: "Your dispute has been submitted for review."
      });
      setDisputingReviewId(null);
      setDisputeReason("");
    } else {
      toast({
        title: "Dispute Failed",
        description: "Unable to submit dispute. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHide = async (reviewId: string) => {
    if (!onHideReview) return;
    
    const success = await onHideReview(reviewId);
    if (success) {
      toast({
        title: "Review Hidden",
        description: "Review has been hidden for 30 days using 1 ClearCredit."
      });
    } else {
      toast({
        title: "Hide Failed",
        description: "Unable to hide review. Check your ClearCredits balance.",
        variant: "destructive"
      });
    }
  };

  const handleFeature = async (reviewId: string) => {
    if (!onFeatureReview) return;
    
    const success = await onFeatureReview(reviewId);
    if (success) {
      toast({
        title: "Review Featured",
        description: "Review is now featured on your profile using 1 ClearCredit."
      });
    } else {
      toast({
        title: "Feature Failed",
        description: "Unable to feature review. Check your ClearCredits balance.",
        variant: "destructive"
      });
    }
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            Reviews will appear here once work has been completed and reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className={review.is_featured ? "border-primary bg-primary/5" : ""}>
          {review.is_featured && (
            <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
              ⭐ Featured Review
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Job #{review.job_number} • {review.platform_system}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Completed {format(new Date(review.completion_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex gap-2">
                {review.is_negative && (
                  <Badge variant="destructive" className="text-xs">
                    Negative
                  </Badge>
                )}
                {review.is_disputed && (
                  <Badge variant="outline" className="text-xs">
                    Disputed
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">Communication</div>
                  <Badge className={getScoreDisplay(review.communication_score).color}>
                    {getScoreDisplay(review.communication_score).text}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">{second}</div>
                  <Badge className={getScoreDisplay(
                    userRole === 'field_rep' 
                      ? review.on_time_performance_score! 
                      : review.paid_on_time_score!
                  ).color}>
                    {getScoreDisplay(
                      userRole === 'field_rep' 
                        ? review.on_time_performance_score! 
                        : review.paid_on_time_score!
                    ).text}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">{third}</div>
                  <Badge className={getScoreDisplay(
                    userRole === 'field_rep' 
                      ? review.quality_of_work_score! 
                      : review.provided_what_needed_score!
                  ).color}>
                    {getScoreDisplay(
                      userRole === 'field_rep' 
                        ? review.quality_of_work_score! 
                        : review.provided_what_needed_score!
                    ).text}
                  </Badge>
                </div>
              </div>

              {/* Review Text */}
              {review.review_text && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{review.review_text}</p>
                </div>
              )}

              {/* Own Profile Actions */}
              {isOwnProfile && user?.id === review.reviewed_user_id && (
                <div className="flex gap-2 pt-2">
                  {/* Hide Review */}
                  {!review.hidden_by_credits && onHideReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHide(review.id)}
                      className="text-xs"
                    >
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hide (1 CC)
                    </Button>
                  )}

                  {/* Feature Positive Review */}
                  {!review.is_negative && !review.is_featured && onFeatureReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeature(review.id)}
                      className="text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Feature (1 CC)
                    </Button>
                  )}

                  {/* Dispute Negative Review */}
                  {review.is_negative && !review.is_disputed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisputingReviewId(review.id)}
                      className="text-xs"
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      Dispute
                    </Button>
                  )}
                </div>
              )}

              {/* Dispute Form */}
              {disputingReviewId === review.id && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium">Dispute Reason</label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Explain why this review should be disputed..."
                      className="w-full mt-1 p-2 border rounded-md text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDispute(review.id)}
                      disabled={!disputeReason.trim()}
                    >
                      Submit Dispute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDisputingReviewId(null);
                        setDisputeReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrustScoreReviewList;
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    id: string;
    display_name: string;
    role: string;
  };
  onReviewSubmitted: () => void;
}

const ReviewModal = ({ open, onOpenChange, targetUser, onReviewSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_user_id: targetUser.id,
          rating,
          review_text: reviewText,
          work_completed_date: workDate || null
        });

      if (reviewError) {
        throw reviewError;
      }

      // Award credits for reviewing
      await supabase.rpc('award_credits', {
        target_user_id: user.id,
        rule_name_param: targetUser.role === 'vendor' ? 'review_vendor' : 'review_field_rep',
        reference_id_param: targetUser.id,
        reference_type_param: 'review'
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! You've earned 1 credit.",
      });

      // Reset form
      setRating(0);
      setReviewText("");
      setWorkDate("");
      onReviewSubmitted();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Review submission error:', error);
      toast({
        title: "Review Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Review {targetUser.display_name}</CardTitle>
          <CardDescription>
            Share your experience working with this {targetUser.role.replace('_', ' ')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`h-6 w-6 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Work Date */}
          <div>
            <label className="text-sm font-medium">Work Completion Date (optional)</label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full mt-2 p-2 border rounded-md"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium">Review (optional)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details about your experience..."
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewModal;
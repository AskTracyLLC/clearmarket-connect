import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TrustScoreReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    id: string;
    display_name: string;
    role: 'field_rep' | 'vendor';
  };
  onReviewSubmitted: () => void;
}

type ScoreValue = -2 | 0 | 2;

const TrustScoreReviewModal: React.FC<TrustScoreReviewModalProps> = ({
  open,
  onOpenChange,
  targetUser,
  onReviewSubmitted
}) => {
  const [jobNumber, setJobNumber] = useState("");
  const [platformSystem, setPlatformSystem] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scores for different categories
  const [communicationScore, setCommunicationScore] = useState<ScoreValue | null>(null);
  const [secondScore, setSecondScore] = useState<ScoreValue | null>(null);
  const [thirdScore, setThirdScore] = useState<ScoreValue | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  const getScoreButtons = (currentScore: ScoreValue | null, onChange: (score: ScoreValue) => void, category: 'communication' | 'second' | 'third') => {
    const getButtonOptions = () => {
      if (category === 'communication') {
        return [
          { value: 2, label: "✅ Helpful and responsive (+2 pts)", variant: "default" as const },
          { value: 0, label: "😐 Responded, but not helpful (0 pts)", variant: "secondary" as const },
          { value: -2, label: "❌ No Response (–2 pts)", variant: "destructive" as const }
        ];
      } else if (targetUser.role === 'field_rep') {
        if (category === 'second') { // On-Time Performance
          return [
            { value: 2, label: "✅ Completed On Time (+2 pts)", variant: "default" as const },
            { value: -2, label: "❌ Missed Due Date (–2 pts)", variant: "destructive" as const }
          ];
        } else { // Quality of Work
          return [
            { value: 2, label: "✅ Client Accepted Without Rejection (+2 pts)", variant: "default" as const },
            { value: 0, label: "😐 Rejected but Corrected Within 72 hrs (0 pts)", variant: "secondary" as const },
            { value: -2, label: "❌ Order Rejected, No Fix Within 72 hrs (–2 pts)", variant: "destructive" as const }
          ];
        }
      } else { // vendor - Field Rep reviewing Vendor
        if (category === 'second') { // Paid On-Time
          return [
            { value: 2, label: "✅ Paid On Time (+2 pts)", variant: "default" as const },
            { value: -2, label: "❌ Paid Late / Not at All (–2 pts)", variant: "destructive" as const }
          ];
        } else { // Provided What Was Needed
          return [
            { value: 2, label: "✅ Yes, all instructions/docs were provided (+2 pts)", variant: "default" as const },
            { value: -2, label: "❌ No, missing details/instructions prevented completion (–2 pts)", variant: "destructive" as const }
          ];
        }
      }
    };

    const options = getButtonOptions();
    
    return (
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={currentScore === option.value ? option.variant : "outline"}
            size="sm"
            onClick={() => onChange(option.value as ScoreValue)}
            className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  };

  const getCategoryLabels = () => {
    if (targetUser.role === 'field_rep') {
      return {
        second: 'On-Time Performance',
        third: 'Quality of Work',
        secondDesc: 'Did they complete the work on time?',
        thirdDesc: 'Was the work quality acceptable?'
      };
    } else {
      return {
        second: '💸 Paid On-Time',
        third: '📦 Provided What Was Needed',
        secondDesc: 'Did the vendor pay you on time for this job?',
        thirdDesc: 'Did the vendor give you everything you needed to complete the job?'
      };
    }
  };

  const { second, third, secondDesc, thirdDesc } = getCategoryLabels();

  const isNegativeReview = communicationScore === -2 || secondScore === -2 || thirdScore === -2;
  const canSubmit = communicationScore !== null && secondScore !== null && thirdScore !== null &&
                   jobNumber.trim() && platformSystem.trim() && completionDate &&
                   (!isNegativeReview || reviewText.trim() || attachments.length > 0);

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;

    setIsSubmitting(true);

    try {
      // Check if user can submit review (frequency limit)
      const { data: canSubmitData } = await supabase.rpc('can_submit_review', {
        reviewer_user_id: user.id,
        target_user_id: targetUser.id
      });

      if (!canSubmitData) {
        toast({
          title: "Review Limit Reached",
          description: "You can only review this user once per week. The limit resets every Sunday.",
          variant: "destructive",
        });
        return;
      }

      // Submit the trust score review
      const reviewData = {
        reviewer_id: user.id,
        reviewed_user_id: targetUser.id,
        job_number: jobNumber,
        platform_system: platformSystem,
        completion_date: completionDate,
        review_type: targetUser.role,
        communication_score: communicationScore,
        review_text: reviewText || null,
        attachments: attachments.length > 0 ? attachments : null
      };

      // Add role-specific scores
      if (targetUser.role === 'field_rep') {
        Object.assign(reviewData, {
          on_time_performance_score: secondScore,
          quality_of_work_score: thirdScore
        });
      } else {
        Object.assign(reviewData, {
          paid_on_time_score: secondScore,
          provided_what_needed_score: thirdScore
        });
      }

      const { error: reviewError } = await supabase
        .from('trust_score_reviews')
        .insert(reviewData);

      if (reviewError) {
        throw reviewError;
      }

      // Award Rep Points for reviewing
      await supabase.rpc('award_rep_points', {
        target_user_id: user.id,
        points_amount: 1,
        rule_name_param: 'trust_score_review',
        reference_id_param: targetUser.id,
        reference_type_param: 'trust_review'
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! You've earned 1 Rep Point.",
      });

      // Reset form
      setJobNumber("");
      setPlatformSystem("");
      setCompletionDate("");
      setReviewText("");
      setAttachments([]);
      setCommunicationScore(null);
      setSecondScore(null);
      setThirdScore(null);
      
      onReviewSubmitted();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Trust score review submission error:', error);
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Review {targetUser.display_name}</CardTitle>
          <CardDescription>
            Submit a trust score review for this {targetUser.role.replace('_', ' ')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobNumber">Job # *</Label>
              <Input
                id="jobNumber"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                placeholder="Enter job number"
              />
            </div>
            <div>
              <Label htmlFor="platformSystem">Platform/System *</Label>
              <Input
                id="platformSystem"
                value={platformSystem}
                onChange={(e) => setPlatformSystem(e.target.value)}
                placeholder="e.g. SquareRooms, FNC"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="completionDate">Completion Date *</Label>
            <Input
              id="completionDate"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Trust Score Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold">Trust Score Ratings</h4>
            
            {/* Communication */}
            <div className="space-y-2">
              <Label>🧩 Communication *</Label>
              <p className="text-sm text-muted-foreground">
                Did the vendor respond to messages in a timely and helpful way?
              </p>
              {getScoreButtons(communicationScore, setCommunicationScore, 'communication')}
            </div>

            {/* Second Category */}
            <div className="space-y-2">
              <Label>{second} *</Label>
              <p className="text-sm text-muted-foreground">{secondDesc}</p>
              {getScoreButtons(secondScore, setSecondScore, 'second')}
            </div>

            {/* Third Category */}
            <div className="space-y-2">
              <Label>{third} *</Label>
              <p className="text-sm text-muted-foreground">{thirdDesc}</p>
              {getScoreButtons(thirdScore, setThirdScore, 'third')}
            </div>
          </div>

          {/* Negative Review Requirements */}
          {isNegativeReview && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <p className="text-sm text-destructive font-medium mb-2">
                Negative Review Requirements
              </p>
              <p className="text-sm text-muted-foreground">
                Since you've given a negative rating, you must provide either a detailed explanation 
                or upload supporting screenshots.
              </p>
            </div>
          )}

          {/* Review Comments */}
          <div>
            <Label htmlFor="reviewText">
              💬 Review Comments {isNegativeReview ? '*' : '(optional)'}
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Explain what went well or what caused issues {isNegativeReview ? '(required for negative reviews)' : '(optional for positive)'}
            </p>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details about your experience..."
              rows={4}
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>
              📎 Upload Screenshot(s) {isNegativeReview && attachments.length === 0 && !reviewText.trim() ? '*' : '(optional)'}
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              {isNegativeReview ? 'Required if any category is marked ❌' : 'Optional for positive reviews'}
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload screenshots or documents
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Image or PDF files accepted
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
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
              disabled={isSubmitting || !canSubmit}
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

export default TrustScoreReviewModal;
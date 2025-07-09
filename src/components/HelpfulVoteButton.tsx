import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface HelpfulVoteButtonProps {
  targetId: string;
  targetType: 'post' | 'comment';
  currentVotes: number;
  onVoteChange: (newCount: number) => void;
  className?: string;
}

const HelpfulVoteButton = ({ 
  targetId, 
  targetType, 
  currentVotes, 
  onVoteChange, 
  className 
}: HelpfulVoteButtonProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('helpful_votes')
        .select('id')
        .eq('voter_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .maybeSingle();

      setHasVoted(!!data);
    };

    checkVoteStatus();
  }, [user, targetId, targetType]);

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on posts.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);

    try {
      if (hasVoted) {
        // Remove vote
        const { error } = await supabase
          .from('helpful_votes')
          .delete()
          .eq('voter_id', user.id)
          .eq('target_id', targetId)
          .eq('target_type', targetType);

        if (error) throw error;

        // Update the target's helpful votes count
        const table = targetType === 'post' ? 'community_posts' : 'community_comments';
        const { error: updateError } = await supabase
          .from(table)
          .update({ helpful_votes: Math.max(0, currentVotes - 1) })
          .eq('id', targetId);

        if (updateError) throw updateError;

        setHasVoted(false);
        onVoteChange(Math.max(0, currentVotes - 1));
        
        toast({
          title: "Vote Removed",
          description: "Your helpful vote has been removed.",
        });

      } else {
        // Add vote
        const { error } = await supabase
          .from('helpful_votes')
          .insert({
            voter_id: user.id,
            target_id: targetId,
            target_type: targetType
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Already Voted",
              description: "You have already voted on this item.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        // Update the target's helpful votes count
        const table = targetType === 'post' ? 'community_posts' : 'community_comments';
        const { error: updateError } = await supabase
          .from(table)
          .update({ helpful_votes: currentVotes + 1 })
          .eq('id', targetId);

        if (updateError) throw updateError;

        // Award credits to the voter (for marking others' content as helpful)
        await supabase.rpc('award_credits', {
          target_user_id: user.id,
          rule_name_param: 'mark_helpful',
          reference_id_param: targetId,
          reference_type_param: targetType
        });

        // Award credits to the content author (for receiving helpful votes)
        // First get the author ID
        const { data: authorData } = await supabase
          .from(table)
          .select('user_id')
          .eq('id', targetId)
          .single();

        if (authorData) {
          // Determine which helpful rule to use based on current vote count
          let ruleName = 'helpful_click_first';
          if (currentVotes === 1) {
            ruleName = 'helpful_click_second';
          } else if (currentVotes >= 2) {
            ruleName = 'helpful_click_third';
          }

          await supabase.rpc('award_credits', {
            target_user_id: authorData.user_id,
            rule_name_param: ruleName,
            reference_id_param: targetId,
            reference_type_param: targetType
          });
        }

        setHasVoted(true);
        onVoteChange(currentVotes + 1);
        
        toast({
          title: "Marked as Helpful",
          description: "Thanks for your feedback! You've earned 1 credit.",
        });
      }

    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: "Vote Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "ghost"}
      size="sm"
      onClick={handleVote}
      disabled={isVoting}
      className={`flex items-center gap-2 ${className}`}
    >
      <Heart className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
      <span className="text-xs">
        {currentVotes > 0 && `${currentVotes} `}
        {hasVoted ? 'Helpful' : 'Mark Helpful'}
      </span>
    </Button>
  );
};

export default HelpfulVoteButton;
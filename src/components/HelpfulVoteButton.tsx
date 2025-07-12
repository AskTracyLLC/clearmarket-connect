import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
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

      try {
        const { data } = await supabase
          .from('helpful_votes')
          .select('id')
          .eq('voter_id', user.id)
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .maybeSingle();

        setHasVoted(!!data);
      } catch (error) {
        console.error('Error checking vote status:', error);
        // Fail silently for now
      }
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

        // NOTE: Credit system temporarily disabled - will add back later
        
        setHasVoted(true);
        onVoteChange(currentVotes + 1);
        
        toast({
          title: "Marked as Helpful",
          description: "Thanks for your feedback!",
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

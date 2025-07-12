import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Flag, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { getPostTypeColor } from "@/utils/postTypeColors";

interface SimpleCommunityPostCardProps {
  post: CommunityPost;
  onClick: () => void;
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
}

const SimpleCommunityPostCard = ({ post, onClick, onVote, onFlag }: SimpleCommunityPostCardProps) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    try {
      await onVote(post.id, 'helpful');
    } finally {
      setIsVoting(false);
    }
  };

  const handleFlag = async () => {
    await onFlag(post.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getPostTypeColor(post.post_type)} text-xs`}
            >
              {post.post_type.replace('-', ' ')}
            </Badge>
            {post.flagged && (
              <Badge variant="destructive" className="text-xs">
                Flagged
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>

        <div onClick={onClick}>
          {post.title && (
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {post.title}
            </h3>
          )}
          
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {(post.user_tags?.length > 0 || post.system_tags?.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.user_tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.system_tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{post.helpful_votes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClick}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Reply</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              className="text-muted-foreground hover:text-destructive"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
            {post.is_anonymous ? "A" : "U"}
          </div>
          <span className="text-sm text-muted-foreground">
            {post.is_anonymous ? "Anonymous" : "Community Member"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCommunityPostCard;
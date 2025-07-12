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
        <div className="flex gap-4">
          {/* Author info - Left side */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {post.is_anonymous ? "A" : (post.author_display_name?.charAt(0)?.toUpperCase() || post.author_anonymous_username?.charAt(0)?.toUpperCase() || "U")}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium leading-tight">
                {post.is_anonymous 
                  ? "Anonymous" 
                  : (post.author_display_name || post.author_anonymous_username || "Community Member")
                }
              </div>
              {!post.is_anonymous && (
                <div className="flex flex-col gap-1 mt-1">
                  {post.author_role && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {post.author_role.replace('_', ' ')}
                    </Badge>
                  )}
                  <div className="flex flex-col text-xs text-muted-foreground">
                    {post.author_trust_score !== null && (
                      <span>Trust: {post.author_trust_score}</span>
                    )}
                    {post.author_community_score !== null && (
                      <span>Community: {post.author_community_score}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post content - Right side */}
          <div className="flex-1 min-w-0">
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
              
              <p className="text-muted-foreground mb-4 line-clamp-3 whitespace-pre-wrap">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCommunityPostCard;
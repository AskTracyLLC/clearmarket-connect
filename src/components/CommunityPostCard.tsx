import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Flag, Star, Bookmark, Camera, CheckCircle, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/data/mockCommunityPosts";
import UserBadge from "./UserBadge";
import HelpfulVoteButton from "./HelpfulVoteButton";
import { getPostTypeColor } from "@/utils/postTypeColors";

interface CommunityPostCardProps {
  post: CommunityPost;
  onClick: () => void;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onFollow: (postId: number) => void;
  onSave: (postId: number) => void;
}

const CommunityPostCard = ({ post, onClick, onVote, onFlag, onFollow, onSave }: CommunityPostCardProps) => {
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle voting with feedback
  const handleVote = async (type: 'helpful' | 'not-helpful') => {
    setIsVoting(true);
    try {
      await onVote(post.id, type);
      toast({
        title: type === 'helpful' ? 'Marked as helpful!' : 'Feedback recorded',
        description: "Thank you for your contribution to the community.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  // Handle flagging with confirmation
  const handleFlag = async () => {
    setIsFlagging(true);
    try {
      await onFlag(post.id);
      toast({
        title: "Post Flagged",
        description: "Our moderation team will review this post.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFlagging(false);
    }
  };

  // Handle follow with feedback
  const handleFollow = async () => {
    setIsFollowing(true);
    try {
      await onFollow(post.id);
      toast({
        title: post.isFollowed ? "Unfollowed" : "Following",
        description: post.isFollowed 
          ? "You will no longer receive notifications for this post." 
          : "You'll be notified of new replies to this post.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    } finally {
      setIsFollowing(false);
    }
  };

  // Handle save with feedback
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(post.id);
      toast({
        title: post.isSaved ? "Removed from saved" : "Saved",
        description: post.isSaved 
          ? "Post removed from your saved items." 
          : "Post saved to your collection.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update save status.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
        post.isFlagged ? 'opacity-50 bg-muted/30' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-primary text-sm">
                  {post.isAnonymous ? "?" : post.authorInitials}
                </span>
              </div>
              
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getPostTypeColor(post.type)}>
                    {post.type}
                  </Badge>
                  {post.isTrending && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Flame className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {post.isFollowed && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Following
                    </Badge>
                  )}
                  {post.isSaved && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Saved
                    </Badge>
                  )}
                  {post.isResolved && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                  {post.isFlagged && (
                    <Badge variant="destructive">
                      Flagged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(post.timePosted, { addSuffix: true })}
                  </span>
                  {post.communityScore && (
                    <span className="text-xs text-muted-foreground">
                      • Score: {post.communityScore}
                    </span>
                  )}
                </div>
                {/* User Badges */}
                {post.authorBadges && post.authorBadges.length > 0 && !post.isAnonymous && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {post.authorBadges.map((badge, index) => (
                      <UserBadge key={index} badge={badge} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground break-words">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground break-words">
              {post.content}
            </p>
            
            {/* System Tags */}
            {post.systemTags && post.systemTags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {post.systemTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Screenshots Preview */}
            {post.screenshots && post.screenshots.length > 0 && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {post.screenshots.length} screenshot{post.screenshots.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-1">
                  {post.screenshots.slice(0, 3).map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-8 h-8 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interaction buttons - Mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              <HelpfulVoteButton
                targetId={post.id.toString()}
                targetType="post"
                currentVotes={post.helpfulVotes}
                onVoteChange={(newCount) => {
                  post.helpfulVotes = newCount;
                }}
                className="h-8"
              />
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                disabled={isVoting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote('not-helpful');
                }}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-xs">{post.notHelpfulVotes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                disabled={isFlagging}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlag();
                }}
              >
                <Flag className="h-3 w-3" />
                <span className="text-xs">Flag</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                disabled={isFollowing}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow();
                }}
              >
                <Star className={`h-3 w-3 ${post.isFollowed ? 'fill-current' : ''}`} />
                <span className="text-xs">Follow</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                <Bookmark className={`h-3 w-3 ${post.isSaved ? 'fill-current' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
            </div>

            {post.replies.length > 0 && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityPostCard;
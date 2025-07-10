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
      className={`group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer border-l-4 ${
        post.type === 'question' ? 'border-l-blue-500' : 
        post.type === 'vendor-alert' ? 'border-l-orange-500' : 
        post.type === 'field-update' ? 'border-l-green-500' : 
        'border-l-gray-300'
      } ${post.isFlagged ? 'opacity-50 bg-muted/30' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Add subtle background pattern for trending posts */}
        {post.isTrending && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-50 rounded-lg pointer-events-none" />
        )}
        
        <div className="space-y-4 relative">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  post.type === 'question' ? 'bg-blue-100' : 
                  post.type === 'vendor-alert' ? 'bg-orange-100' : 
                  'bg-green-100'
                }`}>
                  <span className="font-semibold text-sm">
                    {post.isAnonymous ? "?" : post.authorInitials}
                  </span>
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge 
                    variant="outline" 
                    className={`${getPostTypeColor(post.type)} font-medium`}
                  >
                    {post.type.replace('-', ' ').toUpperCase()}
                  </Badge>
                  
                  {post.isTrending && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                      <Flame className="h-3 w-3 mr-1" />
                      HOT
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
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(post.timePosted, { addSuffix: true })}</span>
                  {post.communityScore && (
                    <>
                      <span>•</span>
                      <span className="font-medium">Trust Score: {post.communityScore}</span>
                    </>
                  )}
                </div>
                
                {/* User Badges */}
                {post.authorBadges && post.authorBadges.length > 0 && !post.isAnonymous && (
                  <div className="flex gap-1 mt-1">
                    {post.authorBadges.map((badge, index) => (
                      <UserBadge key={index} badge={badge} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground line-clamp-2 text-lg">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
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
              <div className="flex items-center gap-2 pt-2">
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
                      className="w-8 h-8 object-cover rounded border hover:scale-110 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Interaction buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <HelpfulVoteButton
                targetId={post.id.toString()}
                targetType="post"
                currentVotes={post.helpfulVotes}
                onVoteChange={(newCount) => {
                  post.helpfulVotes = newCount;
                }}
                className="h-9"
              />
              
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 gap-2 transition-all duration-200 hover:scale-105 ${
                  isVoting ? 'opacity-50' : ''
                }`}
                disabled={isVoting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote('not-helpful');
                }}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">Not Helpful</span>
                <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs">
                  {post.notHelpfulVotes}
                </Badge>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-9 gap-2 transition-all duration-200 hover:scale-105 ${
                  isFlagging ? 'opacity-50' : ''
                }`}
                disabled={isFlagging}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlag();
                }}
              >
                <Flag className="h-4 w-4" />
                <span className="text-sm font-medium">Flag</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-9 gap-2 transition-all duration-200 hover:scale-105 ${
                  post.isFollowed ? 'bg-primary/10 text-primary border-primary/20' : ''
                } ${isFollowing ? 'opacity-50' : ''}`}
                disabled={isFollowing}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow();
                }}
              >
                <Star className={`h-4 w-4 ${post.isFollowed ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">Follow</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-9 gap-2 transition-all duration-200 hover:scale-105 ${
                  post.isSaved ? 'bg-primary/10 text-primary border-primary/20' : ''
                } ${isSaving ? 'opacity-50' : ''}`}
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                <Bookmark className={`h-4 w-4 ${post.isSaved ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">Save</span>
              </Button>
            </div>

            {post.replies.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-medium">{post.replies.length}</span>
                <span>{post.replies.length === 1 ? 'reply' : 'replies'}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityPostCard;
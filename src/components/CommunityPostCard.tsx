import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Flag, Star, Bookmark, Camera, CheckCircle, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/data/mockCommunityPosts";
import UserBadge from "./UserBadge";

interface CommunityPostCardProps {
  post: CommunityPost;
  onClick: () => void;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onFollow: (postId: number) => void;
  onSave: (postId: number) => void;
}

const getPostTypeColor = (type: string) => {
  switch (type) {
    case "Coverage Needed": return "bg-red-100 text-red-800 border-red-200";
    case "Platform Help": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Warnings": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Tips": return "bg-green-100 text-green-800 border-green-200";
    case "Industry News": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const CommunityPostCard = ({ post, onClick, onVote, onFlag, onFollow, onSave }: CommunityPostCardProps) => {
  return (
    <Card 
      className={`hover:shadow-elevated transition-all duration-300 cursor-pointer ${
        post.isFlagged ? 'opacity-50 bg-muted/30' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="font-semibold text-primary text-sm">
                  {post.isAnonymous ? "?" : post.authorInitials}
                </span>
              </div>
              <div className="flex flex-col">
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
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
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
              <div className="flex items-center gap-2 pt-1">
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

          {/* Interaction buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(post.id, 'helpful');
                }}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs">{post.helpfulVotes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(post.id, 'not-helpful');
                }}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-xs">{post.notHelpfulVotes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlag(post.id);
                }}
              >
                <Flag className="h-3 w-3" />
                <span className="text-xs">Flag</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow(post.id);
                }}
              >
                <Star className={`h-3 w-3 ${post.isFollowed ? 'fill-current' : ''}`} />
                <span className="text-xs">Follow</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(post.id);
                }}
              >
                <Bookmark className={`h-3 w-3 ${post.isSaved ? 'fill-current' : ''}`} />
                <span className="text-xs">Save</span>
              </Button>
            </div>

            {post.replies.length > 0 && (
              <span className="text-xs text-muted-foreground">
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
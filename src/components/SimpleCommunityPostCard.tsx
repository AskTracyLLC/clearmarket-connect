import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Flag, Bookmark, MessageCircle, Laugh, Camera } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { getPostTypeColor } from "@/utils/postTypeColors";

interface SimpleCommunityPostCardProps {
  post: CommunityPost;
  onClick: () => void;
  onReply: () => void;
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
  onFunnyVote?: (postId: string) => void;
}

const SimpleCommunityPostCard = ({ 
  post, 
  onClick, 
  onReply, 
  onVote, 
  onFlag,
  onFunnyVote
}: SimpleCommunityPostCardProps) => {
  const { toggleSavePost, isPostSaved } = useSavedPosts();
  const [isSaved, setIsSaved] = useState(false);

  // Check if post is saved on component mount
  useState(() => {
    isPostSaved(post.id).then(setIsSaved);
  });

  const handleVote = () => {
    onVote(post.id, 'helpful');
  };

  const handleFlag = () => {
    onFlag(post.id);
  };

  const handleFunnyVote = () => {
    if (onFunnyVote) {
      onFunnyVote(post.id);
    }
  };

  const handleSave = async () => {
    await toggleSavePost(post.id);
    const saved = await isPostSaved(post.id);
    setIsSaved(saved);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
        post.flagged ? 'opacity-60 bg-muted/30' : 'hover:shadow-lg'
      } ${getPostTypeColor(post.post_type)}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {post.is_anonymous ? "A" : post.author_anonymous_username?.[0] || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {post.is_anonymous ? "Anonymous" : post.author_display_name || "Community Member"}
                </span>
                <Badge 
                  variant="outline" 
                  className={`${getPostTypeColor(post.post_type)} text-xs`}
                >
                  {post.post_type.replace('-', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} • {post.section}
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {post.title}
          </h3>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {(post.user_tags?.length > 0 || post.system_tags?.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.user_tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.system_tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Screenshots indicator */}
        {post.screenshots && post.screenshots.length > 0 && (
          <div className="flex items-center gap-1 mb-4 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            <span>{post.screenshots.length} image{post.screenshots.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleVote();
              }}
              className="text-muted-foreground hover:text-primary"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-xs">{post.helpful_votes}</span>
            </Button>

            {onFunnyVote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFunnyVote();
                }}
                className="text-muted-foreground hover:text-orange-500"
              >
                <Laugh className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.funny_votes || 0}</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReply();
              }}
              className="text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className={`text-muted-foreground hover:text-primary ${
                isSaved ? 'text-primary' : ''
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFlag();
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCommunityPostCard;
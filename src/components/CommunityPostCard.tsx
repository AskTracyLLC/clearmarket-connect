import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Flag, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/data/mockCommunityPosts";

interface CommunityPostCardProps {
  post: CommunityPost;
  onClick: () => void;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onPing: (postId: number) => void;
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

const CommunityPostCard = ({ post, onClick, onVote, onFlag, onPing }: CommunityPostCardProps) => {
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPostTypeColor(post.type)}>
                    {post.type}
                  </Badge>
                  {post.isPinged && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pinged
                    </Badge>
                  )}
                  {post.isFlagged && (
                    <Badge variant="destructive">
                      Flagged
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(post.timePosted, { addSuffix: true })}
                </span>
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
                  onPing(post.id);
                }}
              >
                <Eye className="h-3 w-3" />
                <span className="text-xs">Ping</span>
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
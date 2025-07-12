import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Flag, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { getPostTypeColor } from "@/utils/postTypeColors";

interface SimplePostDetailModalProps {
  post: CommunityPost;
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
  onClose: () => void;
}

const SimplePostDetailModal = ({ post, onVote, onFlag, onClose }: SimplePostDetailModalProps) => {
  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getPostTypeColor(post.post_type)} text-xs`}
            >
              {post.post_type.replace('-', ' ')}
            </Badge>
            {post.title && <span>{post.title}</span>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Author and timestamp */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              {post.is_anonymous ? "A" : "U"}
            </div>
            <span>{post.is_anonymous ? "Anonymous" : "Community Member"}</span>
          </div>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {(post.user_tags?.length > 0 || post.system_tags?.length > 0) && (
          <div className="flex flex-wrap gap-2">
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
              onClick={() => onVote(post.id, 'helpful')}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{post.helpful_votes} helpful</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFlag(post.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
            <span>Flag</span>
          </Button>
        </div>

        {/* Placeholder for replies */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center py-4">
            Reply functionality coming soon
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

export default SimplePostDetailModal;
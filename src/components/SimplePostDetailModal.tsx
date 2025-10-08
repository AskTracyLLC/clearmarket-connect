import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Flag, Laugh, Bookmark, Camera, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { getPostTypeColor } from "@/utils/postTypeColors";
import { useState } from "react";

interface SimplePostDetailModalProps {
  post: CommunityPost;
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
  onFunnyVote?: (postId: string) => void;
  onClose: () => void;
}

const SimplePostDetailModal = ({ post, onVote, onFlag, onFunnyVote, onClose }: SimplePostDetailModalProps) => {
  const { toggleSavePost, isPostSaved } = useSavedPosts();
  const [isSaved, setIsSaved] = useState(false);

  // Check if post is saved on component mount
  useState(() => {
    isPostSaved(post.id).then(setIsSaved);
  });

  const handleSave = async () => {
    await toggleSavePost(post.id);
    const saved = await isPostSaved(post.id);
    setIsSaved(saved);
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${getPostTypeColor(post.post_type)} text-xs`}
          >
            {post.post_type.replace('-', ' ')}
          </Badge>
          {post.title && <span>{post.title}</span>}
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

        {/* Screenshots */}
        {post.screenshots && post.screenshots.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Screenshots ({post.screenshots.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {post.screenshots.slice(0, 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Screenshot ${index + 1}`}
                  className="rounded-lg border max-h-48 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(post.id, 'helpful')}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{post.helpful_votes} helpful</span>
            </Button>

            {onFunnyVote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFunnyVote(post.id)}
                className="flex items-center gap-1 text-muted-foreground hover:text-orange-500"
              >
                <Laugh className="h-4 w-4" />
                <span>{post.funny_votes || 0} funny</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reply</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`text-muted-foreground hover:text-primary ${
                isSaved ? 'text-primary' : ''
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>

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
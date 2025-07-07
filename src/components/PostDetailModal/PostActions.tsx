import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Flag, Star, Bookmark, CheckCircle } from "lucide-react";
import { CommunityPost } from "@/data/mockCommunityPosts";

interface PostActionsProps {
  post: CommunityPost;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onFollow: (postId: number) => void;
  onSave: (postId: number) => void;
  onResolve: (postId: number) => void;
}

const PostActions = ({ post, onVote, onFlag, onFollow, onSave, onResolve }: PostActionsProps) => {
  return (
    <div className="flex items-center gap-2 pt-2 border-t">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => onVote(post.id, 'helpful')}
      >
        <ThumbsUp className="h-4 w-4" />
        Helpful ({post.helpfulVotes})
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => onVote(post.id, 'not-helpful')}
      >
        <ThumbsDown className="h-4 w-4" />
        Not Helpful ({post.notHelpfulVotes})
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => onFlag(post.id)}
      >
        <Flag className="h-4 w-4" />
        Flag
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => onFollow(post.id)}
      >
        <Star className={`h-4 w-4 ${post.isFollowed ? 'fill-current' : ''}`} />
        {post.isFollowed ? 'Unfollow' : 'Follow'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => onSave(post.id)}
      >
        <Bookmark className={`h-4 w-4 ${post.isSaved ? 'fill-current' : ''}`} />
        {post.isSaved ? 'Unsave' : 'Save'}
      </Button>

      {!post.isResolved && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => onResolve(post.id)}
        >
          <CheckCircle className="h-4 w-4" />
          Mark Resolved
        </Button>
      )}
    </div>
  );
};

export default PostActions;
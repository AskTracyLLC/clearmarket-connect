import { CommunityPost } from "@/data/mockCommunityPosts";
import ReplyItem from "./ReplyItem";

interface RepliesListProps {
  post: CommunityPost;
  onReplyVote: (replyId: number, type: 'helpful' | 'not-helpful') => void;
  onPinReply: (postId: number, replyId: number) => void;
}

const RepliesList = ({ post, onReplyVote, onPinReply }: RepliesListProps) => {
  if (post.replies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold text-foreground">
        Replies ({post.replies.length})
      </h3>
      
      <div className="space-y-3">
        {post.replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            post={post}
            onReplyVote={onReplyVote}
            onPinReply={onPinReply}
          />
        ))}
      </div>
    </div>
  );
};

export default RepliesList;
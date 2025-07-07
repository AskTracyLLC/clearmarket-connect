import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommunityPost } from "@/data/mockCommunityPosts";
import PostModalHeader from "./PostDetailModal/PostModalHeader";
import PostAuthorInfo from "./PostDetailModal/PostAuthorInfo";
import PostContent from "./PostDetailModal/PostContent";
import PostActions from "./PostDetailModal/PostActions";
import RepliesList from "./PostDetailModal/RepliesList";
import ReplyForm from "./PostDetailModal/ReplyForm";

interface PostDetailModalProps {
  post: CommunityPost;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onReplyVote: (replyId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onFollow: (postId: number) => void;
  onSave: (postId: number) => void;
  onResolve: (postId: number) => void;
  onPinReply: (postId: number, replyId: number) => void;
}

const PostDetailModal = ({ 
  post, 
  onVote, 
  onReplyVote, 
  onFlag, 
  onFollow, 
  onSave, 
  onResolve, 
  onPinReply 
}: PostDetailModalProps) => {
  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          <PostModalHeader post={post} />
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <PostAuthorInfo post={post} />
        
        <PostContent post={post} />

        <PostActions
          post={post}
          onVote={onVote}
          onFlag={onFlag}
          onFollow={onFollow}
          onSave={onSave}
          onResolve={onResolve}
        />

        <RepliesList
          post={post}
          onReplyVote={onReplyVote}
          onPinReply={onPinReply}
        />

        <ReplyForm />
      </div>
    </DialogContent>
  );
};

export default PostDetailModal;
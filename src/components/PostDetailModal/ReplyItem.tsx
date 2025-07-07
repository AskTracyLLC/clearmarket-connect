import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Reply, CommunityPost } from "@/data/mockCommunityPosts";
import UserBadge from "../UserBadge";

interface ReplyItemProps {
  reply: Reply;
  post: CommunityPost;
  onReplyVote: (replyId: number, type: 'helpful' | 'not-helpful') => void;
  onPinReply: (postId: number, replyId: number) => void;
}

const ReplyItem = ({ reply, post, onReplyVote, onPinReply }: ReplyItemProps) => {
  return (
    <div className={`rounded-lg p-3 space-y-2 ${
      post.pinnedReplyId === reply.id 
        ? 'bg-emerald-50 border border-emerald-200' 
        : 'bg-muted/30'
    }`}>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="font-semibold text-primary text-xs">
              {reply.authorInitials}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{reply.authorInitials}</span>
              {reply.communityScore && (
                <span className="text-xs text-muted-foreground">
                  • Score: {reply.communityScore}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(reply.timePosted, { addSuffix: true })}
              </span>
              {/* Reply Author Badges */}
              {reply.authorBadges && reply.authorBadges.length > 0 && (
                <div className="flex gap-1">
                  {reply.authorBadges.map((badge, index) => (
                    <UserBadge key={index} badge={badge} size="sm" />
                  ))}
                </div>
              )}
              {post.pinnedReplyId === reply.id && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  <Pin className="h-3 w-3 mr-1" />
                  Answer
                </Badge>
              )}
            </div>
          </div>
        </div>
       
        {!post.isResolved && post.pinnedReplyId !== reply.id && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1"
            onClick={() => onPinReply(post.id, reply.id)}
          >
            <Pin className="h-3 w-3" />
            <span className="text-xs">Pin as Answer</span>
          </Button>
        )}
      </div>
      
      <p className="text-sm text-foreground pl-8">
        {reply.content}
      </p>
      
      <div className="flex items-center gap-2 pl-8">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1"
          onClick={() => onReplyVote(reply.id, 'helpful')}
        >
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs">{reply.helpfulVotes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1"
          onClick={() => onReplyVote(reply.id, 'not-helpful')}
        >
          <ThumbsDown className="h-3 w-3" />
          <span className="text-xs">{reply.notHelpfulVotes}</span>
        </Button>
      </div>
    </div>
  );
};

export default ReplyItem;
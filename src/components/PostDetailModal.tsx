import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, Flag, Star, Bookmark, Camera, CheckCircle, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost, Reply } from "@/data/mockCommunityPosts";

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

const PostDetailModal = ({ post, onVote, onReplyVote, onFlag, onFollow, onSave, onResolve, onPinReply }: PostDetailModalProps) => {
  const [replyText, setReplyText] = useState("");

  const handleAddReply = () => {
    if (replyText.trim()) {
      // In a real app, this would add the reply to the post
      console.log("Adding reply:", replyText);
      setReplyText("");
    }
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Badge variant="outline" className={getPostTypeColor(post.type)}>
            {post.type}
          </Badge>
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
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Post Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="font-semibold text-primary">
              {post.isAnonymous ? "?" : post.authorInitials}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {post.isAnonymous ? "Anonymous" : post.authorInitials}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(post.timePosted, { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className={`space-y-3 ${post.isFlagged ? 'opacity-50' : ''}`}>
          <h2 className="text-xl font-semibold text-foreground">
            {post.title}
          </h2>
          <p className="text-foreground whitespace-pre-wrap">
            {post.content}
          </p>
          
          {/* Screenshots */}
          {post.screenshots && post.screenshots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {post.screenshots.length} screenshot{post.screenshots.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {post.screenshots.map((screenshot, index) => (
                  <img
                    key={index}
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto max-h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(screenshot, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Post Actions */}
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

        {/* Replies Section */}
        {post.replies.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-foreground">
              Replies ({post.replies.length})
            </h3>
            
            <div className="space-y-3">
              {post.replies.map((reply) => (
                <div key={reply.id} className={`rounded-lg p-3 space-y-2 ${
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
                      <span className="font-medium text-sm">{reply.authorInitials}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(reply.timePosted, { addSuffix: true })}
                      </span>
                      {post.pinnedReplyId === reply.id && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          <Pin className="h-3 w-3 mr-1" />
                          Answer
                        </Badge>
                      )}
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
              ))}
            </div>
          </div>
        )}

        {/* Add Reply */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-foreground">Add a Reply</h4>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Share your thoughts or help..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddReply}
              disabled={!replyText.trim()}
              variant="hero"
            >
              Post Reply
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default PostDetailModal;
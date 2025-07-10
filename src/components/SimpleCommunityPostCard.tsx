import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleUserBadge from "./SimpleUserBadge";
import { 
  ThumbsUp,
  MessageSquare, 
  Share2, 
  Flag, 
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/useCommunityPosts";

interface SimpleCommunityPostCardProps {
  post: CommunityPost;
  onVote: (postId: string) => void;
  onFlag: (postId: string, reason?: string) => void;
}

export const SimpleCommunityPostCard = ({ post, onVote, onFlag }: SimpleCommunityPostCardProps) => {
  const [shared, setShared] = useState(false);

  const handleVote = () => {
    onVote(post.id);
  };

  const handleFlag = (reason?: string) => {
    onFlag(post.id, reason);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <SimpleUserBadge 
              name={post.users?.display_name || 'Anonymous'}
              role={post.users?.role || 'user'}
              showTrustScore={false}
            />
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFlag('Spam')}>
                <Flag className="h-4 w-4 mr-2" />
                Report as Spam
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFlag('Inappropriate')}>
                <Flag className="h-4 w-4 mr-2" />
                Report as Inappropriate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.flagged && (
            <Badge variant="destructive" className="text-xs">
              Under Review
            </Badge>
          )}
        </div>
        
        <p className="text-sm leading-relaxed">{post.content}</p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              className={`flex items-center gap-2 ${post.hasUserVoted ? 'text-primary' : ''}`}
            >
              <ThumbsUp className={`h-4 w-4 ${post.hasUserVoted ? 'fill-current' : ''}`} />
              <span>{post.helpful_votes || 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Reply</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>{shared ? 'Copied!' : 'Share'}</span>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Post #{post.id.slice(-6)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
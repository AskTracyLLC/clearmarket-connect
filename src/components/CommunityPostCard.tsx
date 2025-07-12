import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Star, 
  Bookmark, 
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/usePostManagement";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import HelpfulVoteButton from "./HelpfulVoteButton";

interface CommunityPostCardProps {
  post: CommunityPost;
  onClick?: () => void;
  onVote?: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag?: (postId: string) => void;
  onFollow?: (postId: string) => void;
  onSave?: (postId: string) => void;
  getDisplayName?: (user: any, userProfile: any) => string;
}

const CommunityPostCard = ({ 
  post, 
  onClick, 
  onVote,
  onFlag,
  onFollow,
  onSave,
  getDisplayName
}: CommunityPostCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleVote = async (voteType: 'helpful' | 'not-helpful') => {
    if (!onVote) return;
    setIsVoting(true);
    await onVote(post.id, voteType);
    setIsVoting(false);
  };

  const handleFlag = async () => {
    if (!onFlag) return;
    setIsFlagging(true);
    await onFlag(post.id);
    setIsFlagging(false);
  };

  const handleFollow = async () => {
    if (!onFollow) return;
    setIsFollowing(true);
    await onFollow(post.id);
    setIsFollowing(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    await onSave(post.id);
    setIsSaving(false);
  };

  // Function to get display name with proper priority
  const getUserDisplayName = () => {
    if (getDisplayName) {
      return getDisplayName(post.user, post.user_profile);
    }
    
    // Fallback logic if getDisplayName is not provided
    // 1. Priority: anonymous_username (user_profiles.username)
    if (post.user_profile?.username) {
      return post.user_profile.username;
    }
    
    // 2. Custom display_name (users.display_name)
    if (post.user?.display_name) {
      return post.user.display_name;
    }
    
    // 3. Constructed name from profile
    if (post.user_profile?.first_name || post.user_profile?.last_name) {
      const firstName = post.user_profile.first_name || "";
      const lastName = post.user_profile.last_name || "";
      return `${firstName} ${lastName}`.trim() || "Anonymous User";
    }
    
    // 4. Final fallback
    return "Anonymous User";
  };

  // Function to get user initials for avatar
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    
    // Handle formats like "FieldRep#123" or "Vendor#456"
    if (displayName.includes('#')) {
      const parts = displayName.split('#');
      const prefix = parts[0];
      return prefix.slice(0, 2).toUpperCase();
    }
    
    // Handle regular names
    const words = displayName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  // Function to get role badge
  const getRoleBadge = () => {
    if (!post.user?.role) return null;
    
    const roleColors = {
      admin: "bg-red-100 text-red-700 border-red-200",
      moderator: "bg-purple-100 text-purple-700 border-purple-200", 
      vendor: "bg-blue-100 text-blue-700 border-blue-200",
      field_rep: "bg-green-100 text-green-700 border-green-200"
    };

    const roleLabels = {
      admin: "Admin",
      moderator: "Moderator",
      vendor: "Vendor", 
      field_rep: "Field Rep"
    };

    const colorClass = roleColors[post.user.role as keyof typeof roleColors] || "bg-gray-100 text-gray-700 border-gray-200";
    const label = roleLabels[post.user.role as keyof typeof roleLabels] || post.user.role;

    return (
      <Badge variant="outline" className={`text-xs ${colorClass}`}>
        {label}
      </Badge>
    );
  };

  // Extract title and content from post content
  const parseContent = () => {
    const content = post.content || "";
    const lines = content.split('\n');
    
    // If first line looks like a title (short and followed by more content), use it as title
    if (lines.length > 1 && lines[0].length < 100 && lines[0].length > 10) {
      return {
        title: lines[0],
        content: lines.slice(1).join('\n').trim()
      };
    }
    
    // Otherwise, use first 60 chars as title if content is long
    if (content.length > 60) {
      return {
        title: content.substring(0, 60) + "...",
        content: content
      };
    }
    
    return {
      title: content,
      content: ""
    };
  };

  const { title, content } = parseContent();
  const displayName = getUserDisplayName();

  return (
    <div
      className={`bg-card text-card-foreground p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer relative ${
        post.flagged ? 'border-destructive/50 bg-destructive/5' : ''
      }`}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-semibold text-primary text-sm">
                {getUserInitials()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-medium text-sm truncate">
                  {displayName}
                </div>
                
                {getRoleBadge()}
                
                {post.flagged && (
                  <Badge variant="destructive" className="text-xs">
                    Flagged
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                {post.user?.trust_score && (
                  <span className="text-xs text-muted-foreground">
                    • Trust: {post.user.trust_score}
                  </span>
                )}
                {post.user?.community_score && (
                  <span className="text-xs text-muted-foreground">
                    • Community: {post.user.community_score}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {title && (
            <h3 className="font-semibold text-foreground break-words">
              {title}
            </h3>
          )}
          
          {content && (
            <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
              {content}
            </p>
          )}
          
          {!title && !content && (
            <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
              {post.content}
            </p>
          )}
        </div>

        {/* Interaction buttons - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            <HelpfulVoteButton
              targetId={post.id}
              targetType="post"
              currentVotes={post.helpful_votes}
              onVoteChange={(newCount) => {
                // Update handled by parent component
              }}
              className="h-8"
            />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              disabled={isFlagging}
              onClick={(e) => {
                e.stopPropagation();
                handleFlag();
              }}
            >
              <Flag className="h-3 w-3" />
              <span className="text-xs">Flag</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              disabled={isFollowing}
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
            >
              <Star className={`h-3 w-3 ${post.isFollowed ? 'fill-current' : ''}`} />
              <span className="text-xs">Follow</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              disabled={isSaving}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              <Bookmark className={`h-3 w-3 ${post.isSaved ? 'fill-current' : ''}`} />
              <span className="text-xs">Save</span>
            </Button>
          </div>

          {/* Comments count */}
          {post.comments && post.comments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{post.comments.length} repl{post.comments.length === 1 ? 'y' : 'ies'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard;

import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/data/mockCommunityPosts";
import UserBadge from "../UserBadge";

interface PostAuthorInfoProps {
  post: CommunityPost;
}

const PostAuthorInfo = ({ post }: PostAuthorInfoProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="font-semibold text-primary">
          {post.isAnonymous ? "?" : post.authorInitials}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium">
            {post.isAnonymous ? "Anonymous" : post.authorInitials}
          </div>
          {post.communityScore && (
            <span className="text-sm text-muted-foreground">
              • Score: {post.communityScore}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(post.timePosted, { addSuffix: true })}
        </div>
        {/* User Badges */}
        {post.authorBadges && post.authorBadges.length > 0 && !post.isAnonymous && (
          <div className="flex gap-1 mt-1">
            {post.authorBadges.map((badge, index) => (
              <UserBadge key={index} badge={badge} size="md" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostAuthorInfo;
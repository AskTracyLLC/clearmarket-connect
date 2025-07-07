import { Badge } from "@/components/ui/badge";
import { CheckCircle, Pin, Flame } from "lucide-react";
import { CommunityPost } from "@/data/mockCommunityPosts";
import { getPostTypeColor } from "@/utils/postTypeColors";

interface PostModalHeaderProps {
  post: CommunityPost;
}

const PostModalHeader = ({ post }: PostModalHeaderProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className={getPostTypeColor(post.type)}>
        {post.type}
      </Badge>
      {post.isTrending && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Flame className="h-3 w-3 mr-1" />
          Trending
        </Badge>
      )}
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
    </div>
  );
};

export default PostModalHeader;
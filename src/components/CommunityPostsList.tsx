import { Card, CardContent } from "@/components/ui/card";
import { CommunityPost } from "@/data/mockCommunityPosts";
import { CommunityPostSkeleton } from "@/components/ui/skeleton-loader";
import { CommunityEmptyState } from "@/components/ui/empty-states";
import CommunityPostCard from "./CommunityPostCard";

interface CommunityPostsListProps {
  posts: CommunityPost[];
  onPostClick: (post: CommunityPost) => void;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onFollow: (postId: number) => void;
  onSave: (postId: number) => void;
  isLoading?: boolean;
  onCreatePost?: () => void;
}

const CommunityPostsList = ({ 
  posts, 
  onPostClick, 
  onVote, 
  onFlag, 
  onFollow, 
  onSave,
  isLoading = false,
  onCreatePost
}: CommunityPostsListProps) => {
  
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommunityPostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <CommunityEmptyState onCreatePost={onCreatePost} />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick(post)}
          onVote={onVote}
          onFlag={onFlag}
          onFollow={onFollow}
          onSave={onSave}
        />
      ))}
    </div>
  );
};

export default CommunityPostsList;
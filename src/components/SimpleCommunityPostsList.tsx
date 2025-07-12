import { CommunityPost } from "@/hooks/useCommunityPosts";
import SimpleCommunityPostCard from "./SimpleCommunityPostCard";

interface SimpleCommunityPostsListProps {
  posts: CommunityPost[];
  onPostClick: (post: CommunityPost) => void;
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
}

const SimpleCommunityPostsList = ({ 
  posts, 
  onPostClick, 
  onVote, 
  onFlag
}: SimpleCommunityPostsListProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <SimpleCommunityPostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick(post)}
          onVote={onVote}
          onFlag={onFlag}
        />
      ))}
    </div>
  );
};

export default SimpleCommunityPostsList;
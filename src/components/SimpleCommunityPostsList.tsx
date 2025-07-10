import { Skeleton } from "@/components/ui/skeleton";
import { SimpleCommunityPostCard } from "./SimpleCommunityPostCard";
import { CommunityPost } from "@/hooks/useCommunityPosts";

interface SimpleCommunityPostsListProps {
  posts: CommunityPost[];
  loading: boolean;
  onVote: (postId: string) => void;
  onFlag: (postId: string, reason?: string) => void;
}

export const SimpleCommunityPostsList = ({ posts, loading, onVote, onFlag }: SimpleCommunityPostsListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts found. Be the first to start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <SimpleCommunityPostCard 
          key={post.id} 
          post={post} 
          onVote={onVote}
          onFlag={onFlag}
        />
      ))}
    </div>
  );
};
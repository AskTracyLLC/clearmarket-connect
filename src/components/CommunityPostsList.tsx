import { CommunityPost } from "@/hooks/usePostManagement";
import CommunityPostCard from "./CommunityPostCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityPostsListProps {
  posts: CommunityPost[];
  loading?: boolean;
  onPostClick?: (post: CommunityPost) => void;
  onVote?: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag?: (postId: string) => void;
  onFollow?: (postId: string) => void;
  onSave?: (postId: string) => void;
  generateAnonymousUsername?: (user: any, userId: string) => string;
}

const CommunityPostsList = ({ 
  posts, 
  loading = false,
  onPostClick,
  onVote,
  onFlag,
  onFollow,
  onSave,
  generateAnonymousUsername
}: CommunityPostsListProps) => {

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeletons */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-card p-4 rounded-lg border space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Posts Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Be the first to start a conversation in the community! Share your thoughts, ask questions, or help fellow members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick?.(post)}
          onVote={onVote}
          onFlag={onFlag}
          onFollow={onFollow}
          onSave={onSave}
          getDisplayName={generateAnonymousUsername}
        />
      ))}
    </div>
  );
};

export default CommunityPostsList;

import { Card, CardContent } from "@/components/ui/card";
import { CommunityPost } from "@/data/mockCommunityPosts";
import CommunityPostCard from "./CommunityPostCard";

interface CommunityPostsListProps {
  posts: CommunityPost[];
  onPostClick: (post: CommunityPost) => void;
  onVote: (postId: number, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: number) => void;
  onFollow: (postId: number) => void;
  onSave: (postId: number) => void;
}

const CommunityPostsList = ({ 
  posts, 
  onPostClick, 
  onVote, 
  onFlag, 
  onFollow, 
  onSave 
}: CommunityPostsListProps) => {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No posts found for the selected filters.</p>
        </CardContent>
      </Card>
    );
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
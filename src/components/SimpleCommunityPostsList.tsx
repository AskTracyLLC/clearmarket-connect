import { useState } from "react";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import SimpleCommunityPostCard from "./SimpleCommunityPostCard";
import SimplePostDetailModal from "./SimplePostDetailModal";
import { Dialog } from "@/components/ui/dialog";

interface SimpleCommunityPostsListProps {
  posts: CommunityPost[];
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
  onFunnyVote?: (postId: string) => void;
}

const SimpleCommunityPostsList = ({ 
  posts, 
  onVote, 
  onFlag,
  onFunnyVote
}: SimpleCommunityPostsListProps) => {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  const handleReplyClick = (post: CommunityPost) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <SimpleCommunityPostCard
            key={post.id}
            post={post}
            onClick={() => handlePostClick(post)}
            onReply={() => handleReplyClick(post)}
            onVote={onVote}
            onFlag={onFlag}
            onFunnyVote={onFunnyVote}
          />
        ))}
      </div>

      {selectedPost && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <SimplePostDetailModal
            post={selectedPost}
            onClose={() => setIsDetailModalOpen(false)}
            onVote={onVote}
            onFlag={onFlag}
            onFunnyVote={onFunnyVote}
          />
        </Dialog>
      )}
    </>
  );
};

export default SimpleCommunityPostsList;
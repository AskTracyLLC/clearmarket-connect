import { Dialog } from "@/components/ui/dialog";
import { usePostManagement } from "@/hooks/usePostManagement";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";
import { filterPosts, sortPosts } from "@/utils/postUtils";
import CommunityFeedHeader from "./CommunityFeedHeader";
import CommunityPostsList from "./CommunityPostsList";
import PostDetailModal from "./PostDetailModal";

const CommunityFeed = () => {
  const {
    posts,
    selectedPost,
    setSelectedPost,
    handleVote,
    handleReplyVote,
    handleFlag,
    handleFollow,
    handleSave,
    handleResolve,
    handlePinReply,
    handleCreatePost,
  } = usePostManagement();

  const {
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    searchKeyword,
    setSearchKeyword,
    showCreateModal,
    setShowCreateModal,
  } = useCommunityFilters();

  // Filter and sort posts
  const filteredPosts = filterPosts(posts, selectedCategory, searchKeyword);
  const sortedPosts = sortPosts(filteredPosts, sortBy);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        <CommunityFeedHeader
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          handleCreatePost={handleCreatePost}
          resultsCount={sortedPosts.length}
        />

        <CommunityPostsList
          posts={sortedPosts}
          onPostClick={setSelectedPost}
          onVote={handleVote}
          onFlag={handleFlag}
          onFollow={handleFollow}
          onSave={handleSave}
        />
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onVote={handleVote}
            onReplyVote={handleReplyVote}
            onFlag={handleFlag}
            onFollow={handleFollow}
            onSave={handleSave}
            onResolve={handleResolve}
            onPinReply={handlePinReply}
          />
        )}
      </Dialog>
    </div>
  );
};

export default CommunityFeed;
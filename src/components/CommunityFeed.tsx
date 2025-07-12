import { Dialog } from "@/components/ui/dialog";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";
import { filterPosts, sortPosts } from "@/utils/postUtils";
import CommunityFeedHeader from "./CommunityFeedHeader";
import SimpleCommunityPostsList from "./SimpleCommunityPostsList";
import SimplePostDetailModal from "./SimplePostDetailModal";

interface CommunityFeedProps {
  filterType?: "field-rep" | "vendor";
  searchKeyword?: string;
  selectedTags?: string[];
  searchLoading?: boolean;
  searchResults?: any[];
}

const CommunityFeed = ({ 
  filterType, 
  searchKeyword = "", 
  selectedTags = [], 
  searchResults 
}: CommunityFeedProps) => {
  const section = filterType === "field-rep" ? "field-rep-forum" : 
                 filterType === "vendor" ? "vendor-bulletin" : undefined;

  const {
    posts,
    selectedPost,
    setSelectedPost,
    loading,
    error,
    handleVote,
    handleFlag,
    handleCreatePost,
  } = useCommunityPosts(section);

  const {
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    searchKeyword: filterSearchKeyword,
    setSearchKeyword,
    showCreateModal,
    setShowCreateModal,
  } = useCommunityFilters();

  // Use search results if tags are selected, otherwise use all posts
  const postsToShow = selectedTags.length > 0 && searchResults ? 
    searchResults.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      post_type: result.post_type,
      section: section || 'field-rep-forum',
      user_id: result.user_id,
      is_anonymous: false,
      helpful_votes: result.helpful_votes,
      flagged: false,
      created_at: result.created_at,
      updated_at: result.created_at,
      user_tags: result.user_tags || [],
      system_tags: result.system_tags || []
    })) : posts;

  // Filter and sort posts
  const currentSearchKeyword = searchKeyword || filterSearchKeyword;
  const filteredPosts = filterPosts(postsToShow, selectedCategory, currentSearchKeyword);
  const sortedPosts = sortPosts(filteredPosts, sortBy);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        <CommunityFeedHeader
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchKeyword={filterSearchKeyword}
          setSearchKeyword={setSearchKeyword}
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          handleCreatePost={handleCreatePost}
          resultsCount={sortedPosts.length}
        />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-2">Error loading posts: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {selectedTags.length > 0 ? 
                "No posts found with the selected tags" : 
                "No posts yet. Be the first to start a discussion!"
              }
            </p>
          </div>
        ) : (
          <SimpleCommunityPostsList
            posts={sortedPosts}
            onPostClick={setSelectedPost}
            onVote={handleVote}
            onFlag={handleFlag}
          />
        )}
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        {selectedPost && (
          <SimplePostDetailModal
            post={selectedPost}
            onVote={handleVote}
            onFlag={handleFlag}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default CommunityFeed;
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
    loading,
    handleVote,
    handleReplyVote,
    handleFlag,
    handleFollow,
    handleSave,
    handleResolve,
    handlePinReply,
    handleCreatePost,
    getDisplayName
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

  // Filter and sort posts - adapted for real data structure
  const filteredPosts = posts.filter(post => {
    // Category filtering - for now treat all posts as "general" since real data doesn't have categories yet
    if (selectedCategory !== "all" && selectedCategory !== "general") {
      return false;
    }
    
    // Search filtering
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      const content = post.content?.toLowerCase() || "";
      const displayName = getDisplayName(post.user, post.user_profile).toLowerCase();
      
      return content.includes(keyword) || displayName.includes(keyword);
    }
    
    return true;
  });

  // Sort posts - adapted for real data structure
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpful_votes - a.helpful_votes;
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "most-replied":
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      default:
        return b.helpful_votes - a.helpful_votes;
    }
  });

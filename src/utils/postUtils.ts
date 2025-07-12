import { CommunityPost } from "@/hooks/useCommunityPosts";

export type SortOption = "helpful" | "newest" | "post-type";

export const filterPosts = (
  posts: CommunityPost[], 
  selectedCategory: string, 
  searchKeyword: string
) => {
  return posts.filter(post => {
    const categoryMatch = selectedCategory === "all" || post.post_type === selectedCategory;
    const searchMatch = searchKeyword === "" || 
      (post.title && post.title.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      post.content.toLowerCase().includes(searchKeyword.toLowerCase());
    return categoryMatch && searchMatch;
  });
};

export const sortPosts = (posts: CommunityPost[], sortBy: SortOption) => {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpful_votes - a.helpful_votes;
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "post-type":
        return a.post_type.localeCompare(b.post_type);
      default:
        return 0;
    }
  });
};

export const calculateTrending = (post: CommunityPost) => {
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const totalVotes = post.helpful_votes;
  const activityScore = totalVotes;
  
  // Trending if high activity within last 24 hours
  return hoursOld <= 24 && activityScore >= 8;
};

export const categories = [
  "Coverage Needed",
  "Platform Help", 
  "Warnings",
  "Tips",
  "Industry News"
];
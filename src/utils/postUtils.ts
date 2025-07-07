import { CommunityPost } from "@/data/mockCommunityPosts";

export type SortOption = "helpful" | "newest" | "post-type";

export const filterPosts = (
  posts: CommunityPost[], 
  selectedCategory: string, 
  searchKeyword: string
) => {
  return posts.filter(post => {
    const categoryMatch = selectedCategory === "all" || post.type === selectedCategory;
    const searchMatch = searchKeyword === "" || 
      post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      post.content.toLowerCase().includes(searchKeyword.toLowerCase());
    return categoryMatch && searchMatch;
  });
};

export const sortPosts = (posts: CommunityPost[], sortBy: SortOption) => {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return (b.helpfulVotes - b.notHelpfulVotes) - (a.helpfulVotes - a.notHelpfulVotes);
      case "newest":
        return b.timePosted.getTime() - a.timePosted.getTime();
      case "post-type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
};

export const calculateTrending = (post: CommunityPost) => {
  const hoursOld = (Date.now() - post.timePosted.getTime()) / (1000 * 60 * 60);
  const totalVotes = post.helpfulVotes + post.notHelpfulVotes;
  const replyCount = post.replies.length;
  const activityScore = totalVotes + (replyCount * 2) + (post.isFollowed ? 1 : 0) + (post.isSaved ? 1 : 0);
  
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
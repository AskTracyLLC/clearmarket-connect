import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog } from "@/components/ui/dialog";
import { MessageSquare, Users, TrendingUp, Plus, Search, Filter } from "lucide-react";
import SimpleCommunityPostsList from "./SimpleCommunityPostsList";
import SimplePostCreationModal from "./SimplePostCreationModal";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";

interface SimpleCommunityFeedProps {
  section?: string;
  primaryView?: string;
  secondaryFilter?: string;
  searchTerm?: string;
  jobTypeFilter?: string;
}

const SimpleCommunityFeed = ({ 
  section, 
  primaryView = "all", 
  secondaryFilter = "recent",
  searchTerm = "",
  jobTypeFilter = "all"
}: SimpleCommunityFeedProps) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // Get all posts for filtering
  const { posts: allPosts, loading: allLoading, handleVote, handleFlag, handleFunnyVote, handleCreatePost } = useCommunityPosts();
  const { posts: fieldRepPosts, loading: fieldRepLoading } = useCommunityPosts('field-rep-forum');
  const { posts: vendorPosts, loading: vendorLoading } = useCommunityPosts('vendor-bulletin');
  const { posts: betaTestersPost, loading: betaTestersLoading } = useCommunityPosts('beta-testers');

  const handleCreatePostSubmit = async (title: string, content: string) => {
    // Map UI views to valid database sections
    const sectionMap: Record<string, string> = {
      'vendor': 'vendor-forum',
      'field-rep': 'field-rep-forum', 
      'beta-testers': 'beta-testers',
      'all': 'field-rep-forum', // Default for "all" view
      'community': 'field-rep-forum', // Default for "community" view
      'user': 'field-rep-forum', // Default for user posts
      'saved': 'field-rep-forum' // Default for saved posts
    };
    
    // Get valid section - fallback chain ensures we always have a valid value
    const validSection = sectionMap[primaryView] || sectionMap[section || ''] || 'field-rep-forum';
    
    console.log('📝 Creating post with section:', validSection, 'primaryView:', primaryView, 'section prop:', section);
    
    await handleCreatePost({
      type: 'question',
      title: title || undefined,
      content,
      isAnonymous: false,
      systemTags: [],
      userTags: [],
      section: validSection
    });
    setIsPostModalOpen(false);
  };

  // Get posts based on primary view
  const getPostsByPrimaryView = () => {
    switch (primaryView) {
      case "vendor":
        return vendorPosts;
      case "field-rep":
        return fieldRepPosts;
      case "beta-testers":
        return betaTestersPost;
      case "local-news":
        return [];
      case "user":
        // Return posts by current user - would need user ID filtering
        return allPosts; // Placeholder
      case "saved":
        // Return saved posts - would need saved posts data
        return [];
      case "all":
      default:
        return allPosts;
    }
  };

  // Apply secondary filter for sorting
  const applySortFilter = (posts: any[]) => {
    const now = new Date();
    
    switch (secondaryFilter) {
      case "top-day":
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return posts
          .filter(post => new Date(post.created_at) >= dayAgo)
          .sort((a, b) => (b.helpful_votes || 0) - (a.helpful_votes || 0));
      
      case "top-week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return posts
          .filter(post => new Date(post.created_at) >= weekAgo)
          .sort((a, b) => (b.helpful_votes || 0) - (a.helpful_votes || 0));
      
      case "top-month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return posts
          .filter(post => new Date(post.created_at) >= monthAgo)
          .sort((a, b) => (b.helpful_votes || 0) - (a.helpful_votes || 0));
      
      case "top-year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return posts
          .filter(post => new Date(post.created_at) >= yearAgo)
          .sort((a, b) => (b.helpful_votes || 0) - (a.helpful_votes || 0));
      
      case "saved":
        // For now, return empty - this would need saved posts data
        return [];
      
      case "recent":
      default:
        return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const rawPosts = getPostsByPrimaryView();
  const sortedPosts = applySortFilter(rawPosts);
  
  // Apply search filter
  let filteredPosts = sortedPosts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Apply job type filter
  if (jobTypeFilter && jobTypeFilter !== "all") {
    filteredPosts = filteredPosts.filter(post => 
      post.user_tags?.some(tag => 
        tag.toLowerCase().includes(jobTypeFilter.replace('-', ' '))
      ) || 
      post.system_tags?.some(tag => 
        tag.toLowerCase().includes(jobTypeFilter.replace('-', ' '))
      )
    );
  }

  const loading = allLoading || fieldRepLoading || vendorLoading || betaTestersLoading;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            {primaryView === "user" ? "Your Posts" : 
             primaryView === "saved" ? "Saved Posts" :
             primaryView === "vendor" ? "Vendor Posts" :
             primaryView === "field-rep" ? "Field Rep Posts" :
             primaryView === "beta-testers" ? "Beta Testers" :
             "Community Posts"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredPosts.length} posts found
          </p>
        </div>
        <Button onClick={() => setIsPostModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>


      {/* Posts List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : (
        <SimpleCommunityPostsList 
          posts={filteredPosts}
          onVote={handleVote}
          onFlag={handleFlag}
          onFunnyVote={handleFunnyVote}
        />
      )}

      {/* Post Creation Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <SimplePostCreationModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handleCreatePostSubmit}
        />
      </Dialog>
    </div>
  );
};

export default SimpleCommunityFeed;
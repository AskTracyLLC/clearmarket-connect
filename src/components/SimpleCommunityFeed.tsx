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
}

const SimpleCommunityFeed = ({ section, primaryView = "all", secondaryFilter = "recent" }: SimpleCommunityFeedProps) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all posts for filtering
  const { posts: allPosts, loading: allLoading, handleVote, handleFlag, handleCreatePost } = useCommunityPosts();
  const { posts: fieldRepPosts, loading: fieldRepLoading } = useCommunityPosts('field-rep-forum');
  const { posts: vendorPosts, loading: vendorLoading } = useCommunityPosts('vendor-bulletin');

  const handleCreatePostSubmit = async (title: string, content: string) => {
    await handleCreatePost({
      type: 'question',
      title: title || undefined,
      content,
      isAnonymous: false,
      systemTags: [],
      userTags: [],
      section: section || 'field-rep-forum'
    });
    setIsPostModalOpen(false);
  };

  // Get posts based on primary view
  const getPostsByPrimaryView = () => {
    switch (primaryView) {
      case "network":
        // Posts made by vendors you are connected to
        return vendorPosts;
      case "community":
        // Posts made by Field Reps
        return fieldRepPosts;
      case "for-you":
        // Posts specific to the job types the field rep does (determined by profile setup)
        // For now, return field rep posts - this would need user profile data
        return fieldRepPosts;
      case "local-news":
        // User can setup areas of interest
        // For now, return empty array - this would need location-based filtering
        return [];
      case "all":
      default:
        // Mixture of both Network and Community
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
  const filteredPosts = sortedPosts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loading = allLoading || fieldRepLoading || vendorLoading;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Community Feed</h1>
          <Button onClick={() => setIsPostModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{filteredPosts.length}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{new Set(filteredPosts.map(p => p.user_id)).size}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{filteredPosts.reduce((sum, p) => sum + (p.helpful_votes || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

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
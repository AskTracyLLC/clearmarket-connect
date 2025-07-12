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
}

const SimpleCommunityFeed = ({ section }: SimpleCommunityFeedProps) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { posts, loading, handleVote, handleFlag, handleCreatePost } = useCommunityPosts(section);

  const handleCreatePostSubmit = async (content: string) => {
    await handleCreatePost({
      type: 'question',
      title: '',
      content,
      isAnonymous: false,
      systemTags: [],
      userTags: [],
      section: section || 'field-rep-forum'
    });
    setIsPostModalOpen(false);
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <p className="text-2xl font-bold">{posts.length}</p>
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
                <p className="text-2xl font-bold">{new Set(posts.map(p => p.user_id)).size}</p>
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
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.helpful_votes || 0), 0)}</p>
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
          onPostClick={() => {}}
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
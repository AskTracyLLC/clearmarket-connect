import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Megaphone, 
  Bookmark, 
  LifeBuoy, 
  Plus, 
  Search,
  TrendingUp,
  Tag,
  ExternalLink,
  RefreshCw,
  Loader2
} from "lucide-react";
import CommunityFeed from "@/components/CommunityFeed";
import PostCreationModal from "@/components/PostCreationModal";
import { useToast } from "@/components/ui/use-toast";
import { useTrendingTags, useSavedPosts, useTagSearch } from "@/hooks/useTrendingTags";

const CommunityBoard = () => {
  const [activeTab, setActiveTab] = useState("field-rep-forum");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real data hooks
  const { 
    trendingTags, 
    loading: tagsLoading, 
    error: tagsError, 
    refetch: refetchTags 
  } = useTrendingTags({
    section: activeTab === "field-rep-forum" ? "field-rep-forum" : null,
    tagLimit: 5,
    daysBack: 30
  });

  const { 
    savedPosts, 
    loading: savedLoading, 
    toggleSavePost, 
    isPostSaved 
  } = useSavedPosts();

  const {
    searchResults,
    loading: searchLoading
  } = useTagSearch({
    tags: selectedTags,
    section: activeTab === "field-rep-forum" ? "field-rep-forum" : 
             activeTab === "vendor-bulletin" ? "vendor-bulletin" : null,
    enabled: selectedTags.length > 0
  });

  const handleCreatePost = (post: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
    userTags?: string[];
  }) => {
    // Handle post creation based on active tab
    console.log("Creating post for:", activeTab, post);
    setShowCreateModal(false);
    
    toast({
      title: "Post Created",
      description: `Your ${post.type} has been posted successfully.`,
    });

    // Refresh trending tags after creating a post
    setTimeout(() => {
      refetchTags();
    }, 1000);
  };

  const handleSupportCenterClick = () => {
    navigate("/feedback");
  };

  const handleTagClick = (tagName: string) => {
    // Toggle tag selection for filtering
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const formatSavedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Board</h1>
          <p className="text-muted-foreground">
            Connect with fellow professionals, stay updated, and get support
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="field-rep-forum" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Field Rep Forum
            </TabsTrigger>
            <TabsTrigger value="vendor-bulletin" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Vendor Bulletin
            </TabsTrigger>
            <TabsTrigger value="my-saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              My Saved
            </TabsTrigger>
            <TabsTrigger 
              value="support-center" 
              className="flex items-center gap-2"
              onClick={handleSupportCenterClick}
            >
              <LifeBuoy className="h-4 w-4" />
              Support Center
              <ExternalLink className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          {/* Field Rep Forum */}
          <TabsContent value="field-rep-forum" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Field Rep Forum</CardTitle>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Share best practices, ask questions, and connect with fellow field representatives
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trending Tags Section */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Trending Tags</h3>
                      {tagsLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={refetchTags}
                      disabled={tagsLoading}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {tagsError && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Showing sample tags (database connection issue)
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.length > 0 ? (
                      trendingTags.map((tag) => (
                        <Button
                          key={tag.tag_name}
                          variant={selectedTags.includes(tag.tag_name) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTagClick(tag.tag_name)}
                          className="h-7 text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.tag_name}
                          <Badge variant="secondary" className="ml-1 h-4 text-xs">
                            {tag.tag_count}
                          </Badge>
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No trending tags yet. Be the first to create posts with tags!
                      </p>
                    )}
                  </div>
                  
                  {selectedTags.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium">Active filters:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearTagFilters}
                          className="h-6 text-xs"
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="default"
                            className="cursor-pointer text-xs"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag} ✕
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search posts or tags..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <CommunityFeed />
          </TabsContent>

          {/* Vendor Bulletin */}
          <TabsContent value="vendor-bulletin" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Vendor Bulletin</CardTitle>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Announcement
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Network-wide announcements and updates from vendors
                </p>
              </CardHeader>
              <CardContent>
                {/* Search for Vendor Bulletin */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search vendor announcements..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="coverage">Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Posts Feed */}
            <CommunityFeed />
          </TabsContent>

          {/* My Saved */}
          <TabsContent value="my-saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">My Saved Posts</CardTitle>
                <p className="text-muted-foreground">
                  All posts you've bookmarked from across the community
                </p>
              </CardHeader>
              <CardContent>
                {savedLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">Loading saved posts...</span>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No saved posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start saving posts by clicking the bookmark icon on any post
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("field-rep-forum")}>
                      Browse Field Rep Forum
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedPosts.map((post) => (
                      <div key={post.post_id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{post.title || "Untitled Post"}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {post.section === 'field-rep-forum' ? 'Field Rep Forum' : 'Vendor Bulletin'}
                              </Badge>
                              <span>•</span>
                              <span>Saved {formatSavedDate(post.saved_at)}</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSavePost(post.post_id)}
                          >
                            <Bookmark className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Center - This will redirect, so content won't show */}
          <TabsContent value="support-center">
            {/* This content won't be seen since we redirect */}
          </TabsContent>
        </Tabs>

        {/* Post Creation Modal */}
        {showCreateModal && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <PostCreationModal
              onCreatePost={handleCreatePost}
              onClose={() => setShowCreateModal(false)}
            />
          </Dialog>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityBoard;

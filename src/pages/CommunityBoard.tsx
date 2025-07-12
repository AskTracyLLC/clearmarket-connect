import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Loader2,
  Eye,
  AlertCircle
} from "lucide-react";
import ConnectionAwareCommunityFeed from "@/components/ConnectionAwareCommunityFeed";
import PostCreationModal from "@/components/PostCreationModal";
import { useToast } from "@/components/ui/use-toast";
import { useTrendingTags, useSavedPosts, useTagSearch } from "@/hooks/useTrendingTags";
import { supabase } from "@/integrations/supabase/client";

const CommunityBoard = () => {
  const [activeTab, setActiveTab] = useState("field-rep-forum");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'trending' | 'priority'>('newest');
  const [userRole, setUserRole] = useState<'field_rep' | 'vendor' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user role on component mount
  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user role:', error);
            toast({
              title: "Error",
              description: "Failed to load user information",
              variant: "destructive",
            });
          } else {
            setUserRole(userData?.role || null);
          }
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUserRole();
  }, [toast]);

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

  // Check if user can post in current tab
  const canPostInCurrentTab = () => {
    if (!userRole) return false;
    
    if (activeTab === "field-rep-forum") {
      return userRole === "field_rep";
    } else if (activeTab === "vendor-bulletin") {
      return userRole === "vendor";
    }
    
    return false;
  };

  // Get appropriate button text for current tab
  const getCreateButtonText = () => {
    if (activeTab === "field-rep-forum") {
      return "Create Post";
    } else if (activeTab === "vendor-bulletin") {
      return "Post Announcement";
    }
    return "Create Post";
  };

  // Get view-only message for restricted users
  const getViewOnlyMessage = () => {
    if (activeTab === "field-rep-forum" && userRole === "vendor") {
      return "You can view and comment on posts, but only Field Reps can create new posts in this forum.";
    } else if (activeTab === "vendor-bulletin" && userRole === "field_rep") {
      return "You can view and acknowledge announcements, but only Vendors can post announcements here.";
    }
    return "";
  };

  const handleCreatePost = (post: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
    userTags?: string[];
  }) => {
    // Validate user can post in current tab
    if (!canPostInCurrentTab()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to post in this section.",
        variant: "destructive",
      });
      return;
    }

    // Handle post creation based on active tab
    console.log("Creating post for:", activeTab, post);
    setShowCreateModal(false);
    
    const postTypeText = activeTab === "vendor-bulletin" ? "announcement" : "post";
    
    toast({
      title: "Post Created",
      description: `Your ${postTypeText} has been posted successfully.`,
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

  // Show loading spinner while getting user role
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Loading community board...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                  
                  {/* Role-based Create Post Button */}
                  {canPostInCurrentTab() ? (
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {getCreateButtonText()}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">View Only</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Share best practices, ask questions, and connect with fellow field representatives
                </p>
                
                {/* View-only alert for restricted users */}
                {!canPostInCurrentTab() && getViewOnlyMessage() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {getViewOnlyMessage()}
                    </AlertDescription>
                  </Alert>
                )}
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
                    <p className="text-xs text-destructive mb-2">
                      Error loading tags: {tagsError}
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
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'helpful' | 'trending' | 'priority')}>
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
            <ConnectionAwareCommunityFeed 
              boardType="field-rep-forum"
              searchKeyword={searchKeyword}
              selectedTags={selectedTags}
              sortBy={sortBy}
              userRole={userRole}
            />
          </TabsContent>

          {/* Vendor Bulletin */}
          <TabsContent value="vendor-bulletin" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Vendor Bulletin</CardTitle>
                  
                  {/* Role-based Post Announcement Button */}
                  {canPostInCurrentTab() ? (
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {getCreateButtonText()}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">View Only</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {userRole === "field_rep" 
                    ? "Announcements and updates from vendors in your network"
                    : "Network-wide announcements and updates from vendors"
                  }
                </p>
                
                {/* View-only alert for Field Reps */}
                {!canPostInCurrentTab() && getViewOnlyMessage() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {getViewOnlyMessage()}
                    </AlertDescription>
                  </Alert>
                )}
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
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'helpful' | 'trending' | 'priority')}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

{/* Vendor Posts Feed */}
            <ConnectionAwareCommunityFeed 
              boardType="vendor-bulletin"
              searchKeyword={searchKeyword}
              selectedTags={selectedTags}
              sortBy={sortBy}
              userRole={userRole}
            />
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

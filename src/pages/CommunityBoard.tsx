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
import { 
  MessageSquare, 
  Megaphone, 
  Bookmark, 
  LifeBuoy, 
  Plus, 
  Search,
  TrendingUp,
  Tag,
  ExternalLink
} from "lucide-react";
import CommunityFeed from "@/components/CommunityFeed";
import PostCreationModal from "@/components/PostCreationModal";
import { useToast } from "@/components/ui/use-toast";

const CommunityBoard = () => {
  const [activeTab, setActiveTab] = useState("field-rep-forum");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock trending tags - will come from database later
  const trendingTags = [
    { name: "inspection-tips", count: 45 },
    { name: "payment-issues", count: 32 },
    { name: "new-vendor", count: 28 },
    { name: "background-check", count: 24 },
    { name: "scheduling", count: 19 }
  ];

  // Mock saved posts - will come from database later
  const savedPosts = [
    {
      id: 1,
      title: "Best practices for REO inspections",
      originalSection: "Field Rep Forum",
      savedDate: "2 days ago",
      type: "question"
    },
    {
      id: 2,
      title: "New coverage opportunity in Texas",
      originalSection: "Vendor Bulletin", 
      savedDate: "1 week ago",
      type: "vendor-alert"
    }
  ];

  const handleCreatePost = (post: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
  }) => {
    // Handle post creation based on active tab
    console.log("Creating post for:", activeTab, post);
    setShowCreateModal(false);
    
    toast({
      title: "Post Created",
      description: `Your ${post.type} has been posted successfully.`,
    });
  };

  const handleSupportCenterClick = () => {
    navigate("/feedback");
  };

  const handleTagClick = (tagName: string) => {
    setSearchKeyword(tagName);
    // Filter posts by tag
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
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Trending Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTagClick(tag.name)}
                        className="h-7 text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                        <Badge variant="secondary" className="ml-1 h-4 text-xs">
                          {tag.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
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
            <CommunityFeed 
              filterType="field-rep"
              searchKeyword={searchKeyword}
            />
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
            <CommunityFeed 
              filterType="vendor"
              searchKeyword={searchKeyword}
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
                {savedPosts.length === 0 ? (
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
                      <div key={post.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{post.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {post.originalSection}
                              </Badge>
                              <span>•</span>
                              <span>Saved {post.savedDate}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
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
        <PostCreationModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
          postType={activeTab === "vendor-bulletin" ? "vendor-alert" : "question"}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityBoard;

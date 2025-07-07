import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { mockCommunityPosts, CommunityPost } from "@/data/mockCommunityPosts";
import CommunityPostCard from "./CommunityPostCard";
import PostDetailModal from "./PostDetailModal";
import PostCreationModal from "./PostCreationModal";
import CommunityFilters from "./CommunityFilters";

type SortOption = "helpful" | "newest" | "post-type";

const CommunityFeed = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("helpful");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  // Filter posts by categories and systems
  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(post.type);
    const systemMatch = selectedSystems.length === 0 || 
      (post.systemTags && post.systemTags.some(tag => selectedSystems.includes(tag)));
    return categoryMatch && systemMatch;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
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

  const handleVote = (postId: number, type: 'helpful' | 'not-helpful') => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          if (type === 'helpful') {
            return { ...post, helpfulVotes: post.helpfulVotes + 1 };
          } else {
            return { ...post, notHelpfulVotes: post.notHelpfulVotes + 1 };
          }
        }
        return post;
      })
    );

    // Update selected post if it's open
    if (selectedPost && selectedPost.id === postId) {
      if (type === 'helpful') {
        setSelectedPost({ ...selectedPost, helpfulVotes: selectedPost.helpfulVotes + 1 });
      } else {
        setSelectedPost({ ...selectedPost, notHelpfulVotes: selectedPost.notHelpfulVotes + 1 });
      }
    }
  };

  const handleReplyVote = (replyId: number, type: 'helpful' | 'not-helpful') => {
    // Update reply votes in posts
    setPosts(prevPosts =>
      prevPosts.map(post => ({
        ...post,
        replies: post.replies.map(reply => {
          if (reply.id === replyId) {
            if (type === 'helpful') {
              return { ...reply, helpfulVotes: reply.helpfulVotes + 1 };
            } else {
              return { ...reply, notHelpfulVotes: reply.notHelpfulVotes + 1 };
            }
          }
          return reply;
        })
      }))
    );

    // Update selected post if it contains the reply
    if (selectedPost) {
      const updatedReplies = selectedPost.replies.map(reply => {
        if (reply.id === replyId) {
          if (type === 'helpful') {
            return { ...reply, helpfulVotes: reply.helpfulVotes + 1 };
          } else {
            return { ...reply, notHelpfulVotes: reply.notHelpfulVotes + 1 };
          }
        }
        return reply;
      });
      setSelectedPost({ ...selectedPost, replies: updatedReplies });
    }
  };

  const handleFlag = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isFlagged: true } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isFlagged: true });
    }
  };

  const handleFollow = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isFollowed: !post.isFollowed } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isFollowed: !selectedPost.isFollowed });
    }
  };

  const handleSave = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isSaved: !selectedPost.isSaved });
    }
  };

  const handleResolve = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isResolved: true } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isResolved: true });
    }
  };

  const handlePinReply = (postId: number, replyId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, pinnedReplyId: replyId } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, pinnedReplyId: replyId });
    }
  };

  const handleCreatePost = (newPost: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
  }) => {
    const post: CommunityPost = {
      id: Math.max(...posts.map(p => p.id)) + 1,
      type: newPost.type as any,
      title: newPost.title,
      content: newPost.content,
      authorInitials: newPost.isAnonymous ? "Anonymous" : "Y.U.", // Mock current user initials
      isAnonymous: newPost.isAnonymous,
      timePosted: new Date(),
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      isFlagged: false,
      isFollowed: false,
      isSaved: false,
      isResolved: false,
      systemTags: newPost.systemTags,
      replies: []
    };

    setPosts(prevPosts => [post, ...prevPosts]);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSystems([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="flex-shrink-0">
          <CommunityFilters
            selectedCategories={selectedCategories}
            selectedSystems={selectedSystems}
            onCategoryChange={setSelectedCategories}
            onSystemChange={setSelectedSystems}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                Community Board
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Sort by:</label>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="post-type">Post Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Create Post Button */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Create New Post
                    </Button>
                  </DialogTrigger>
                  <PostCreationModal 
                    onCreatePost={handleCreatePost}
                    onClose={() => setShowCreateModal(false)}
                  />
                </Dialog>
              </div>

              {/* Filter Summary */}
              {(selectedCategories.length > 0 || selectedSystems.length > 0) && (
                <div className="text-sm text-muted-foreground">
                  Showing {sortedPosts.length} post{sortedPosts.length !== 1 ? 's' : ''} 
                  {selectedCategories.length > 0 && ` in ${selectedCategories.join(', ')}`}
                  {selectedSystems.length > 0 && ` for ${selectedSystems.join(', ')}`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {sortedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No posts found for the selected filters.</p>
                </CardContent>
              </Card>
            ) : (
              sortedPosts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  onVote={handleVote}
                  onFlag={handleFlag}
                  onFollow={handleFollow}
                  onSave={handleSave}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onVote={handleVote}
            onReplyVote={handleReplyVote}
            onFlag={handleFlag}
            onFollow={handleFollow}
            onSave={handleSave}
            onResolve={handleResolve}
            onPinReply={handlePinReply}
          />
        )}
      </Dialog>
    </div>
  );
};

export default CommunityFeed;
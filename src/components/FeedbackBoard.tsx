import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, MessageSquare, Bell, BellOff, Plus } from 'lucide-react';
import { useFeedbackPosts, FeedbackPost } from '@/hooks/useFeedbackPosts';
import { FeedbackSubmissionModal } from './FeedbackSubmissionModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';

const statusColors = {
  'under-review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'planned': 'bg-blue-100 text-blue-800 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'completed': 'bg-green-100 text-green-800 border-green-200',
  'closed': 'bg-gray-100 text-gray-800 border-gray-200'
};

const categoryLabels = {
  'bug-report': 'Bug Report',
  'feature-request': 'Feature Request'
};

export const FeedbackBoard = () => {
  console.log('🚀 NEW FeedbackBoard component rendering');
  
  const { posts, loading, error, createPost } = useFeedbackPosts();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedbackPost | null>(null);

  console.log('📊 Posts data:', { count: posts.length, loading, error });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Community Feedback</h1>
          <p>Loading feedback posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Community Feedback</h1>
          <p className="text-red-500">Error loading posts: {error.message}</p>
        </div>
      </div>
    );
  }

  const handleSubmitFeedback = async (newPost: Omit<FeedbackPost, 'id' | 'upvotes' | 'userHasUpvoted' | 'userIsFollowing' | 'createdAt' | 'comments'>) => {
    console.log('📝 Submitting feedback:', newPost);
    try {
      const feedbackUser = { username: 'TestUser#1' }; // Mock user for now
      await createPost(newPost, feedbackUser);
      console.log('✅ Feedback submitted successfully');
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
    }
  };

  const handleUpvote = (postId: string) => {
    console.log('👍 Upvote clicked for post:', postId);
    // TODO: Implement upvote functionality
  };

  const handleFollow = (postId: string) => {
    console.log('🔔 Follow clicked for post:', postId);
    // TODO: Implement follow functionality
  };

  const filteredAndSortedPosts = posts
    .filter(post => statusFilter === 'all' || post.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Feedback</h1>
          <p className="text-muted-foreground">Help us improve ClearMarket by sharing your ideas and reporting issues</p>
        </div>
        <Button onClick={() => setIsSubmissionModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Submit Feedback
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="upvotes">Most Upvoted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredAndSortedPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              {posts.length === 0 ? 'No feedback posts yet. Be the first to share your ideas!' : 'No posts match your current filters.'}
            </p>
          </Card>
        ) : (
          filteredAndSortedPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={statusColors[post.status]}>
                        {post.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge variant="secondary">
                        {categoryLabels[post.category]}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 cursor-pointer hover:text-primary" 
                        onClick={() => setSelectedPost(post)}>
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {post.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {post.author} • {post.createdAt}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(post.id)}
                      className={`gap-2 ${post.userHasUpvoted ? 'text-primary' : ''}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${post.userHasUpvoted ? 'fill-current' : ''}`} />
                      {post.upvotes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                      className="gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {post.comments?.length || 0}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFollow(post.id)}
                    className="gap-2"
                  >
                    {post.userIsFollowing ? (
                      <>
                        <BellOff className="h-4 w-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <FeedbackSubmissionModal 
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleSubmitFeedback}
      />

      {selectedPost && (
        <FeedbackDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpvote={() => handleUpvote(selectedPost.id)}
          onFollow={() => handleFollow(selectedPost.id)}
        />
      )}
    </div>
  );
};
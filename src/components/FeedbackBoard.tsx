import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, MessageSquare, Bell, BellOff, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedbackSubmissionModal } from './FeedbackSubmissionModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import { useFeedbackPosts, type FeedbackPost } from '@/hooks/useFeedbackPosts';

interface FeedbackBoardProps {
  currentUser?: any; // For backward compatibility
}

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

export const FeedbackBoard = ({ currentUser }: FeedbackBoardProps = {}) => {
  const { posts, loading, createPost } = useFeedbackPosts();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedbackPost | null>(null);
  const { toast } = useToast();

  const handleUpvote = async (postId: string) => {
    // TODO: Implement upvote functionality with database
    toast({
      title: "Vote recorded",
      description: "Thank you for your feedback!",
    });
  };

  const handleFollow = (postId: string) => {
    // TODO: Implement follow functionality with database
    toast({
      title: "Notification settings updated",
      description: "You'll be notified of updates to this post.",
    });
  };

  const handleSubmitFeedback = async (newPost: { title: string; description: string; category: string }) => {
    const success = await createPost(newPost, currentUser);
    if (success) {
      setIsSubmissionModalOpen(false);
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => statusFilter === 'all' || post.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

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
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {loading ? "Loading feedback posts..." : "No feedback posts found. Be the first to share your thoughts!"}
            </p>
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => setSelectedPost(post)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={statusColors[post.status]}>
                        {post.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge variant="secondary">
                        {categoryLabels[post.category]}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>by {post.author}</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
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
                      0
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
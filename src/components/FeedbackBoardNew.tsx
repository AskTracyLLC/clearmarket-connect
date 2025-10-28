console.log('🚨 FEEDBACK BOARD NEW FILE IS LOADING');

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, MessageSquare, Bell, BellOff, Plus } from 'lucide-react';
import { useFeedbackPosts, FeedbackPost } from '@/hooks/useFeedbackPosts';
import { useFeedbackAuth } from '@/hooks/useFeedbackAuth';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { FeedbackSubmissionModal } from './FeedbackSubmissionModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  'new': 'bg-orange-100 text-orange-800 border-orange-200',
  'under-review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'future-release': 'bg-blue-100 text-blue-800 border-blue-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
  'archived': 'bg-gray-100 text-gray-800 border-gray-200'
};

const categoryLabels = {
  'bug-report': 'Bug Report',
  'feature-request': 'Feature Request',
  'testimony': 'Testimony'
};

export const FeedbackBoardNew = () => {
  console.log('🔥 Component starting...');
  
  const { user: feedbackUser } = useFeedbackAuth();
  const { posts, loading, createPost, updatePost } = useFeedbackPosts();
  const { isAdmin } = useSecureAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedbackPost | null>(null);

  console.log('📊 Posts data:', { count: posts.length, loading });

  if (loading) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Support & Feedback</h2>
        <p>Loading feedback posts...</p>
      </div>
    );
  }

  // ✅ CORRECT: Use the user from component level
  const handleSubmitFeedback = async (newPost: Omit<FeedbackPost, 'id' | 'upvotes' | 'userHasUpvoted' | 'userIsFollowing' | 'createdAt' | 'comments'>) => {
    console.log('📝 Submitting feedback:', newPost);
    console.log('👤 Using feedbackUser:', feedbackUser); // Debug log
    
    try {
      await createPost(newPost, feedbackUser); // Use the user from component level
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

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await updatePost(postId, { status: newStatus as any });
      const removalMessage = newStatus === 'resolved' 
        ? ' This post will be removed from public view in 7 days.' 
        : newStatus === 'archived' 
        ? ' This post will be removed from public view in 14 days.' 
        : '';
      toast({
        title: "Status updated",
        description: `Post status changed to ${newStatus.replace('-', ' ')}.${removalMessage}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getDaysUntilRemoval = (post: FeedbackPost) => {
    if (!post.status_changed_at) return null;
    
    const statusDate = new Date(post.status_changed_at);
    const now = new Date();
    const daysSinceChange = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (post.status === 'resolved') {
      const daysLeft = 7 - daysSinceChange;
      return daysLeft > 0 ? daysLeft : 0;
    } else if (post.status === 'archived') {
      const daysLeft = 14 - daysSinceChange;
      return daysLeft > 0 ? daysLeft : 0;
    }
    return null;
  };

  const filteredAndSortedPosts = posts
    .filter(post => statusFilter === 'all' || post.status === statusFilter)
    .filter(post => categoryFilter === 'all' || post.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Support & Feedback</h2>
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
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="future-release">Future Release</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bug-report">Bug Report</SelectItem>
            <SelectItem value="feature-request">Feature Request</SelectItem>
            <SelectItem value="testimony">Testimony</SelectItem>
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
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <Select 
                            value={post.status} 
                            onValueChange={(value) => handleStatusChange(post.id, value)}
                          >
                            <SelectTrigger className={`w-40 h-7 ${statusColors[post.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="under-review">Under Review</SelectItem>
                              <SelectItem value="future-release">Future Release</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="archived">Archive</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={statusColors[post.status]}>
                            {post.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                        {getDaysUntilRemoval(post) !== null && (
                          <span className="text-sm text-muted-foreground">
                            {getDaysUntilRemoval(post)! > 0 
                              ? `Removing in ${getDaysUntilRemoval(post)} day${getDaysUntilRemoval(post) !== 1 ? 's' : ''}`
                              : 'Removing soon'
                            }
                          </span>
                        )}
                      </div>
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
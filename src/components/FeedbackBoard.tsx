import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, MessageSquare, Bell, BellOff, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FeedbackSubmissionModal } from './FeedbackSubmissionModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';

interface FeedbackUser {
  email: string;
  anonymousUsername: string;
  accessToken: string;
}

interface FeedbackBoardProps {
  currentUser?: FeedbackUser;
}

interface DatabasePost {
  id: string;
  content: string;
  created_at: string;
  helpful_votes: number;
  flagged: boolean;
  users?: {
    display_name: string;
  } | null;
}

interface FeedbackPost {
  id: string;
  title: string;
  description: string;
  category: 'bug-report' | 'feature-request';
  status: 'under-review' | 'planned' | 'in-progress' | 'completed' | 'closed';
  upvotes: number;
  userHasUpvoted: boolean;
  userIsFollowing: boolean;
  author: string;
  createdAt: string;
  comments: any[];
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
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedbackPost | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          created_at,
          helpful_votes,
          flagged,
          users:user_id (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database posts to feedback format
      const transformedPosts: FeedbackPost[] = (data || []).map((post: DatabasePost) => {
        // Extract title and description from content
        const lines = post.content.split('\n');
        const title = lines[0] || 'Untitled';
        const description = lines.slice(1).join('\n') || post.content;

        return {
          id: post.id,
          title,
          description,
          category: 'feature-request', // Default category
          status: 'under-review', // Default status
          upvotes: post.helpful_votes || 0,
          userHasUpvoted: false, // We'll implement this later
          userIsFollowing: false, // We'll implement this later
          author: post.users?.display_name || currentUser?.anonymousUsername || 'Anonymous',
          createdAt: new Date(post.created_at).toISOString().split('T')[0],
          comments: []
        };
      });

      setPosts(transformedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback posts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpvote = async (postId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on feedback.",
        variant: "destructive"
      });
      return;
    }

    try {
      // For now, just update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              upvotes: post.userHasUpvoted ? post.upvotes - 1 : post.upvotes + 1,
              userHasUpvoted: !post.userHasUpvoted 
            }
          : post
      ));

      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to record vote.",
        variant: "destructive"
      });
    }
  };

  const handleFollow = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, userIsFollowing: !post.userIsFollowing }
        : post
    ));
    
    toast({
      title: "Notification settings updated",
      description: "You'll be notified of updates to this post.",
    });
  };

  const handleSubmitFeedback = async (newPost: { title: string; description: string; category: string }) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit feedback.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a fake user ID for the feedback submission
      const tempUserId = 'feedback-user';
      
      // Combine title and description for the content field
      const content = `${newPost.title}\n${newPost.description}`;

      const { error } = await supabase
        .from('community_posts')
        .insert({
          content,
          user_id: tempUserId // We'll need to handle this properly with auth later
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. It will be reviewed by our team.",
      });

      setIsSubmissionModalOpen(false);
      await fetchPosts(); // Refresh the posts
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
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
        {currentUser && (
          <Button onClick={() => setIsSubmissionModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Submit Feedback
          </Button>
        )}
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
            <p className="text-muted-foreground">No feedback posts yet. Be the first to share your thoughts!</p>
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
                      {post.comments.length}
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
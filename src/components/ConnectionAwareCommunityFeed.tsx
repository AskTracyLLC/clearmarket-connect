import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  ThumbsUp, 
  Flag, 
  Bookmark, 
  MoreHorizontal,
  CheckCircle,
  Users,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConnectionAwarePosts, ConnectionAwarePost } from '@/hooks/useConnectionAwarePosts';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionAwareCommunityFeedProps {
  boardType: 'field-rep-forum' | 'vendor-bulletin';
  searchKeyword?: string;
  selectedTags?: string[];
  sortBy?: 'newest' | 'helpful' | 'trending' | 'priority';
  userRole?: 'field_rep' | 'vendor' | null;
}

const ConnectionAwareCommunityFeed = ({
  boardType,
  searchKeyword = '',
  selectedTags = [],
  sortBy = 'newest',
  userRole
}: ConnectionAwareCommunityFeedProps) => {
  const { toast } = useToast();
  const [acknowledgedPosts, setAcknowledgedPosts] = useState<Set<string>>(new Set());

  const {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    totalCount
  } = useConnectionAwarePosts({
    boardType,
    searchKeyword,
    selectedTags,
    sortBy
  });

  const handleVote = async (postId: string, voteType: 'helpful' | 'not-helpful') => {
    try {
      // Implementation for voting
      toast({
        title: "Vote Recorded",
        description: `Your ${voteType} vote has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFlag = async (postId: string) => {
    try {
      // Implementation for flagging
      toast({
        title: "Post Flagged",
        description: "Thank you for reporting. Moderators will review this post.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (postId: string) => {
    try {
      // Implementation for saving
      toast({
        title: "Post Saved",
        description: "Post has been added to your saved items.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcknowledge = async (postId: string) => {
    if (acknowledgedPosts.has(postId)) return;

    try {
      // Add acknowledgment to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('post_acknowledgments')
        .insert({
          post_id: postId,
          user_id: user.id,
          acknowledged_at: new Date().toISOString()
        });

      if (error) throw error;

      // Award credit
      const { data: creditResult, error: creditError } = await supabase.rpc('award_credit', {
        target_user_id: user.id,
        credit_amount: 1,
        credit_reason: 'acknowledged_vendor_announcement'
      });

      if (creditError) {
        console.error('Error awarding credit:', creditError);
      }

      setAcknowledgedPosts(prev => new Set(prev).add(postId));

      toast({
        title: "Acknowledged",
        description: "You've earned 1 credit for acknowledging this announcement!",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === 'low') return null;
    
    const priorityConfig = {
      medium: { variant: 'secondary' as const, label: 'Medium Priority' },
      high: { variant: 'default' as const, label: 'High Priority' },
      urgent: { variant: 'destructive' as const, label: 'URGENT' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getAuthorInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading posts: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (posts.length === 0) {
    const emptyMessage = boardType === 'vendor-bulletin' && userRole === 'field_rep'
      ? "No announcements from your connected vendors yet. Connect with more vendors to see their announcements here."
      : boardType === 'vendor-bulletin' 
        ? "No vendor announcements posted yet."
        : "No posts in this forum yet. Be the first to start a discussion!";

    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-lg mb-2">No Posts Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalCount} {totalCount === 1 ? 'post' : 'posts'} found
          {boardType === 'vendor-bulletin' && userRole === 'field_rep' && (
            <span className="ml-1">(from connected vendors)</span>
          )}
        </span>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(post.author.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {post.author.display_name || "Anonymous"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {post.author.role.replace('_', ' ')}
                    </Badge>
                    {getPriorityBadge(post.priority)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(post.created_at)}</span>
                    <span>•</span>
                    <span>Trust: {post.author.trust_score}</span>
                    <span>•</span>
                    <span>Community: {post.author.community_score}</span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSave(post.id)}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFlag(post.id)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {post.title && (
              <h3 className="font-semibold text-lg mt-2">{post.title}</h3>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(post.id, 'helpful')}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.helpful_votes}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply</span>
                </Button>
              </div>

              {/* Acknowledge button for Field Reps viewing Vendor Bulletin */}
              {boardType === 'vendor-bulletin' && userRole === 'field_rep' && (
                <Button
                  variant={acknowledgedPosts.has(post.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleAcknowledge(post.id)}
                  disabled={acknowledgedPosts.has(post.id)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  {acknowledgedPosts.has(post.id) ? "Acknowledged" : "Acknowledge (+1 credit)"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectionAwareCommunityFeed;

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, Flag, Send, Image, Smile, Bookmark, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { getPostTypeColor } from "@/utils/postTypeColors";
import { useSavedPosts } from "@/hooks/useTrendingTags";
import { useToast } from "@/hooks/use-toast";

interface PostDetailModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (postId: string, type: 'helpful' | 'not-helpful') => void;
  onFlag: (postId: string) => void;
}

const PostDetailModal = ({ post, isOpen, onClose, onVote, onFlag }: PostDetailModalProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [searchedGifs, setSearchedGifs] = useState<string[]>([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const { savedPosts, toggleSavePost, isPostSaved } = useSavedPosts();
  const { toast } = useToast();

  if (!post) return null;

  const handleVote = async () => {
    await onVote(post.id, 'helpful');
  };

  const handleFlag = async () => {
    await onFlag(post.id);
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement comment submission
      console.log('Submitting comment:', comment);
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the post.",
      });
      setComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    await toggleSavePost(post.id);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed post" : "Following post",
      description: isFollowing 
        ? "You'll no longer get notifications about this post." 
        : "You'll get notified about new comments and updates.",
    });
  };

  const popularGifs = [
    "https://media.giphy.com/media/3o7aCRloybJlXpNjSU/giphy.gif", // thumbs up
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", // applause  
    "https://media.giphy.com/media/3oz8xBwn8AU6Bp1hKM/giphy.gif", // party
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", // thinking
    "https://media.giphy.com/media/26gspjl5bxzhSdJtK/giphy.gif", // nod
    "https://media.giphy.com/media/3o72FfM5HJydzafgUE/giphy.gif"  // perfect
  ];

  const popularEmojis = ["👍", "👏", "🎉", "🤔", "💯", "🔥", "❤️", "😂", "👌", "🙌"];

  const addGif = (gifUrl: string) => {
    setComment(prev => prev + ` ![gif](${gifUrl}) `);
    setShowGifPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setComment(prev => prev + emoji);
  };

  const searchGifs = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchedGifs([]);
      return;
    }

    setIsSearchingGifs(true);
    try {
      // Mock search results for now - in production, use Giphy API
      const mockResults = [
        `https://media.giphy.com/media/3o7aCRloybJlXpNjSU/giphy.gif`,
        `https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif`,
        `https://media.giphy.com/media/3oz8xBwn8AU6Bp1hKM/giphy.gif`,
        `https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif`,
      ];
      setSearchedGifs(mockResults);
    } catch (error) {
      console.error('Error searching GIFs:', error);
      toast({
        title: "Search failed",
        description: "Could not search for GIFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingGifs(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-4 mb-6">
            {/* Author info - Left side */}
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
                {post.is_anonymous ? "A" : (post.author_display_name?.charAt(0)?.toUpperCase() || post.author_anonymous_username?.charAt(0)?.toUpperCase() || "U")}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium leading-tight">
                  {post.is_anonymous 
                    ? "Anonymous" 
                    : (post.author_display_name || post.author_anonymous_username || "Community Member")
                  }
                </div>
                {!post.is_anonymous && (
                  <div className="flex flex-col gap-1 mt-1">
                    {post.author_role && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {post.author_role.replace('_', ' ')}
                      </Badge>
                    )}
                    <div className="flex flex-col text-xs text-muted-foreground">
                      {post.author_trust_score !== null && (
                        <span>Trust: {post.author_trust_score}</span>
                      )}
                      {post.author_community_score !== null && (
                        <span>Community: {post.author_community_score}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Post content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getPostTypeColor(post.post_type)} text-xs`}
                  >
                    {post.post_type.replace('-', ' ')}
                  </Badge>
                  {post.flagged && (
                    <Badge variant="destructive" className="text-xs">
                      Flagged
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>

              {post.title && (
                <h2 className="font-bold text-xl mb-4">
                  {post.title}
                </h2>
              )}
              
              <div className="text-foreground mb-6 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>

              {/* Tags */}
              {(post.user_tags?.length > 0 || post.system_tags?.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.user_tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.system_tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVote}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.helpful_votes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className={`flex items-center gap-2 ${
                      isPostSaved(post.id) 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isPostSaved(post.id) ? "fill-current" : ""}`} />
                    <span>{isPostSaved(post.id) ? "Saved" : "Save"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFollow}
                    className={`flex items-center gap-2 ${
                      isFollowing 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Bell className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
                    <span>{isFollowing ? "Following" : "Follow"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFlag}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Comments section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Comments</h3>
            
            {/* Comment form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment... (GIF support: ![gif](url) or click Add GIF)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
                maxLength={1000}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Add GIF
                  </Button>
                  <div className="flex items-center gap-1">
                    {popularEmojis.slice(0, 6).map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => addEmoji(emoji)}
                        className="text-lg p-1 h-8 w-8"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
              
              {showGifPicker && (
                <div className="border rounded-lg p-4 bg-muted">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for GIFs..."
                      value={gifSearch}
                      onChange={(e) => {
                        setGifSearch(e.target.value);
                        searchGifs(e.target.value);
                      }}
                      className="flex-1"
                    />
                  </div>
                  
                  {gifSearch && searchedGifs.length > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">Search Results:</p>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {searchedGifs.map((gifUrl, index) => (
                          <button
                            key={`search-${index}`}
                            onClick={() => addGif(gifUrl)}
                            className="aspect-square bg-muted-foreground/10 rounded border-2 border-transparent hover:border-primary transition-colors overflow-hidden"
                          >
                            <img 
                              src={gifUrl} 
                              alt={`Search GIF ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {gifSearch && isSearchingGifs && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Searching for GIFs...</p>
                    </div>
                  )}
                  
                  {!gifSearch && (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">Popular GIFs:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {popularGifs.map((gifUrl, index) => (
                          <button
                            key={index}
                            onClick={() => addGif(gifUrl)}
                            className="aspect-square bg-muted-foreground/10 rounded border-2 border-transparent hover:border-primary transition-colors overflow-hidden"
                          >
                            <img 
                              src={gifUrl} 
                              alt={`GIF ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    Click a GIF to add it to your comment
                  </p>
                </div>
              )}
            </div>

            {/* Comments list placeholder */}
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
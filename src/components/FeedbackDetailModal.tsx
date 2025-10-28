import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, MessageSquare, Bell, BellOff, Send, Upload, X, Image as ImageIcon } from 'lucide-react';
import { FeedbackPost, FeedbackComment } from '@/hooks/useFeedbackPosts';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';

interface FeedbackDetailModalProps {
  post: FeedbackPost;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: () => void;
  onFollow: () => void;
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

export const FeedbackDetailModal = ({ post, isOpen, onClose, onUpvote, onFollow }: FeedbackDetailModalProps) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>(post.screenshot_urls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useSecureAuth();
  const { toast } = useToast();

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: FeedbackComment = {
        id: Date.now().toString(),
        author: 'You',
        content: newComment,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newScreenshots: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${post.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('feedback-screenshots')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('feedback-screenshots')
          .getPublicUrl(filePath);

        newScreenshots.push(publicUrl);
      }

      // Update post with new screenshots
      const updatedScreenshots = [...screenshots, ...newScreenshots];
      const { error: updateError } = await supabase
        .from('feedback_posts')
        .update({ screenshot_urls: updatedScreenshots })
        .eq('id', post.id);

      if (updateError) throw updateError;

      setScreenshots(updatedScreenshots);
      toast({
        title: "Success",
        description: `${newScreenshots.length} screenshot(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading screenshots:', error);
      toast({
        title: "Error",
        description: "Failed to upload screenshots",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveScreenshot = async (screenshotUrl: string) => {
    try {
      const updatedScreenshots = screenshots.filter(url => url !== screenshotUrl);
      
      const { error } = await supabase
        .from('feedback_posts')
        .update({ screenshot_urls: updatedScreenshots })
        .eq('id', post.id);

      if (error) throw error;

      setScreenshots(updatedScreenshots);
      toast({
        title: "Success",
        description: "Screenshot removed",
      });
    } catch (error) {
      console.error('Error removing screenshot:', error);
      toast({
        title: "Error",
        description: "Failed to remove screenshot",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={statusColors[post.status]}>
              {post.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge variant="secondary">
              {categoryLabels[post.category]}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{post.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Details */}
          <div>
            <p className="text-muted-foreground mb-2">
              by {post.author} • {post.createdAt}
            </p>
            <p className="whitespace-pre-wrap">{post.description}</p>
          </div>

          {/* Screenshots Section */}
          {(screenshots.length > 0 || isAdmin) && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Screenshots ({screenshots.length})
                  </h3>
                  {isAdmin && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Screenshot'}
                      </Button>
                    </>
                  )}
                </div>
                {screenshots.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {screenshots.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveScreenshot(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUpvote}
              className={`gap-2 ${post.userHasUpvoted ? 'text-primary' : ''}`}
            >
              <ThumbsUp className={`h-4 w-4 ${post.userHasUpvoted ? 'fill-current' : ''}`} />
              {post.upvotes} Upvotes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFollow}
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

          <Separator />

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({comments.length})
            </h3>

            {/* Existing Comments */}
            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

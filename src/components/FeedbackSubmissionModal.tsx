import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FeedbackPost } from '@/data/mockFeedbackData';

interface FeedbackSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<FeedbackPost, 'id' | 'upvotes' | 'userHasUpvoted' | 'userIsFollowing' | 'createdAt' | 'comments'>) => void;
}

export const FeedbackSubmissionModal = ({ isOpen, onClose, onSubmit }: FeedbackSubmissionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bug-report' | 'feature-request'>('feature-request');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && author) {
      onSubmit({
        title,
        description,
        category,
        status: 'under-review',
        author
      });
      setTitle('');
      setDescription('');
      setAuthor('');
      setCategory('feature-request');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as 'bug-report' | 'feature-request')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature-request">Feature Request</SelectItem>
                <SelectItem value="bug-report">Bug Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your feedback"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Your Name</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="How should we credit you?"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
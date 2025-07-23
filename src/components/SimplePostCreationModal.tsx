import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, Plus, Hash } from "lucide-react";

interface SimplePostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
}

const SimplePostCreationModal = ({ isOpen, onClose, onSubmit }: SimplePostCreationModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("question");
  const [userTags, setUserTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(title, content);
      // Reset form
      setTitle("");
      setContent("");
      setUserTags([]);
      setTagInput("");
      setPostType("question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !userTags.includes(tagInput.trim()) && userTags.length < 5) {
      setUserTags([...userTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUserTags(userTags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Create New Post</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Post Type */}
        <div className="space-y-2">
          <Label htmlFor="post-type">Post Type</Label>
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="tip">Tip / Advice</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="news">Industry News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            placeholder="Enter a descriptive title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            placeholder="Share your thoughts, ask a question, or provide helpful information..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={2000}
            required
          />
          <p className="text-xs text-muted-foreground text-right">
            {content.length}/2000 characters
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags (Optional)</Label>
          <div className="flex gap-2">
            <div className="flex-1 flex">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                maxLength={20}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim() || userTags.length >= 5}
                className="ml-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {userTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {userTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Add up to 5 tags to help others find your post. Press Enter or comma to add.
          </p>
        </div>

        {/* Screenshot placeholder */}
        <div className="space-y-2">
          <Label>Screenshots (Coming Soon)</Label>
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Image upload functionality will be available soon
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default SimplePostCreationModal;
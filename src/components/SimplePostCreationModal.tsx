import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SimplePostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
}

const SimplePostCreationModal = ({ onClose, onSubmit }: SimplePostCreationModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(title.trim(), content.trim());
      setTitle("");
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content.trim().length >= 10;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Post</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            placeholder="Give your post a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {title.length}/200 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Share your thoughts, questions, or experiences with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {content.length}/1000 characters (minimum 10)
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Create Post"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default SimplePostCreationModal;
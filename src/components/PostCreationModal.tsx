import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const postTypes = [
  "Coverage Needed",
  "Platform Help", 
  "Warnings",
  "Tips",
  "Industry News"
];

interface PostCreationModalProps {
  onCreatePost: (post: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
  }) => void;
  onClose: () => void;
}

const PostCreationModal = ({ onCreatePost, onClose }: PostCreationModalProps) => {
  const [postType, setPostType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (postType && title.trim() && content.trim()) {
      onCreatePost({
        type: postType,
        title: title.trim(),
        content: content.trim(),
        isAnonymous
      });
      
      // Reset form
      setPostType("");
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      
      onClose();
    }
  };

  const isValid = postType && title.trim() && content.trim();

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Create New Post</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Post Type */}
        <div className="space-y-2">
          <Label htmlFor="post-type">Post Type</Label>
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue placeholder="Select post type" />
            </SelectTrigger>
            <SelectContent>
              {postTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            maxLength={100}
          />
          <div className="text-xs text-muted-foreground text-right">
            {title.length}/100
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share details, ask for help, or provide information..."
            className="min-h-[120px]"
            maxLength={1000}
          />
          <div className="text-xs text-muted-foreground text-right">
            {content.length}/1000
          </div>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <div className="space-y-1">
            <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
              Post anonymously
            </Label>
            <p className="text-xs text-muted-foreground">
              Hide your identity (costs 1 credit)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid}
            variant="hero"
          >
            Create Post
            {isAnonymous && (
              <span className="ml-2 text-xs opacity-80">(-1 credit)</span>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default PostCreationModal;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Camera, X } from "lucide-react";
import { sanitizeInput } from "@/utils/security";

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
    systemTags: string[];
    screenshots?: string[];
  }) => void;
  onClose: () => void;
}

const PostCreationModal = ({ onCreatePost, onClose }: PostCreationModalProps) => {
  const [postType, setPostType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [systemTags, setSystemTags] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [linkError, setLinkError] = useState("");

  const availableSystems = [
    "EZinspections",
    "InspectorADE", 
    "SafeView",
    "Clear Capital",
    "ServiceLink",
    "WorldAPP"
  ];

  const detectLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|int|co|io|app|dev|ly|me|info|biz|tv|cc|us|uk|ca|au|de|fr|jp|cn|in|br|ru|kr|it|es|mx|nl|se|no|dk|fi|pl|tr|sa|za|ng|eg|il|ar|cl|pe|ve|uy|py|bo|ec|co|gt|cr|pa|ni|hn|sv|cu|jm|ht|do|pr|bb|gd|lc|vc|ag|dm|kn|ms|vg|ai|ky|tc|bm|fk|gs|io|ac|sh|ta|cc|cx|nf|hm|tf|aq|bv|sj|pn|nu|tk|cf|ga|gq|st|td|cv|gw|ne|bf|sn|gm|gn|sl|lr|ci|gh|tg|bj|ng|cm|cg|cf|ao|zm|mw|mz|mg|mu|re|sc|yt|km|dj|so|et|er|sd|ly|tn|dz|ma|eh|mr|ml|mr|ne|td|cf|cm|gq|ga|cg|cd|ao|na|bw|sz|ls|za|mz|mg|mu|re|sc|yt|km|dj|so|et|er|sd|ss|eg|ly|tn|dz|ma|eh)\b)/gi;
    return urlRegex.test(text);
  };

  const handleTextChange = (text: string, field: 'title' | 'content') => {
    if (detectLinks(text)) {
      setLinkError("External links are not allowed in posts");
    } else {
      setLinkError("");
    }
    
    if (field === 'title') {
      setTitle(text);
    } else {
      setContent(text);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB");
        return;
      }
      
      if (screenshots.length >= 3) {
        alert("Maximum 3 screenshots allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setScreenshots(prev => [...prev, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (linkError) return;
    
    if (postType && title.trim() && content.trim()) {
      // SECURITY: Sanitize inputs before submission
      onCreatePost({
        type: sanitizeInput(postType),
        title: sanitizeInput(title.trim()),
        content: sanitizeInput(content.trim()),
        isAnonymous,
        systemTags: systemTags.map(tag => sanitizeInput(tag)),
        screenshots: screenshots.length > 0 ? screenshots : undefined
      });
      
      // Reset form
      setPostType("");
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setSystemTags([]);
      setScreenshots([]);
      setLinkError("");
      
      onClose();
    }
  };

  const handleSystemToggle = (system: string) => {
    setSystemTags(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const removeSystemTag = (system: string) => {
    setSystemTags(prev => prev.filter(s => s !== system));
  };

  const isValid = postType && title.trim() && content.trim() && !linkError;

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
            onChange={(e) => handleTextChange(e.target.value, 'title')}
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
            onChange={(e) => handleTextChange(e.target.value, 'content')}
            placeholder="Share details, ask for help, or provide information..."
            className="min-h-[120px]"
            maxLength={1000}
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Screenshots allowed - External links prohibited</span>
            <span className="text-muted-foreground">{content.length}/1000</span>
          </div>
          {linkError && (
            <p className="text-xs text-destructive">{linkError}</p>
          )}
        </div>

        {/* Screenshots */}
        <div className="space-y-2">
          <Label htmlFor="screenshots">Screenshots (Optional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Upload screenshots to help illustrate your post</p>
                <p className="text-xs text-muted-foreground">Max 3 images, 5MB each</p>
              </div>
              <Input
                id="screenshots"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('screenshots')?.click()}
                disabled={screenshots.length >= 3}
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Screenshots
              </Button>
            </div>
          </div>
          
          {screenshots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeScreenshot(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Tags */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            System Familiarity (optional)
          </Label>
          <div className="space-y-2">
            <Select onValueChange={(value) => value && handleSystemToggle(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Add systems you're familiar with..." />
              </SelectTrigger>
              <SelectContent>
                {availableSystems
                  .filter(system => !systemTags.includes(system))
                  .map((system) => (
                  <SelectItem key={system} value={system}>
                    {system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Selected System Tags */}
            {systemTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {systemTags.map((system) => (
                  <Badge
                    key={system}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSystemTag(system)}
                  >
                    {system}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Post Visibility</Label>
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
                {isAnonymous 
                  ? "Your identity will be hidden (costs 1 credit)"
                  : "Your initials will be shown (default, free)"
                }
              </p>
            </div>
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
            {isAnonymous ? "Post Anonymously" : "Create Post"}
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
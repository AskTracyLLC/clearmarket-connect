import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    id: string;
    name: string;
    initials?: string;
    role?: string;
  } | null;
}

const UserCommentModal = ({ open, onOpenChange, targetUser }: UserCommentModalProps) => {
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingComment, setHasExistingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (targetUser && open) {
      // TODO: Load existing comment from user_comments table
      // For now, using mock data
      const mockExistingComment = localStorage.getItem(`comment_${targetUser.id}`);
      if (mockExistingComment) {
        setComment(mockExistingComment);
        setHasExistingComment(true);
        setIsEditing(false);
      } else {
        setComment("");
        setHasExistingComment(false);
        setIsEditing(true);
      }
    }
  }, [targetUser, open]);

  const handleSave = async () => {
    if (!targetUser || !comment.trim()) return;

    try {
      // TODO: Save to user_comments table using Supabase
      // For now, using localStorage
      localStorage.setItem(`comment_${targetUser.id}`, comment);
      
      setHasExistingComment(true);
      setIsEditing(false);
      toast({
        title: "Comment saved",
        description: `Your private note about ${targetUser.name} has been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasExistingComment) {
      // Restore original comment
      const originalComment = localStorage.getItem(`comment_${targetUser?.id}`);
      setComment(originalComment || "");
      setIsEditing(false);
    } else {
      setComment("");
      onOpenChange(false);
    }
  };

  if (!targetUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {targetUser.initials || targetUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>Private Notes: {targetUser.name}</span>
                {targetUser.role && (
                  <Badge variant="secondary" className="text-xs">
                    {targetUser.role}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            These notes are private and only visible to you. Use them to track important information about your interactions.
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Add your private notes about this user..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!comment.trim()}>
                  <Save className="h-3 w-3 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {hasExistingComment ? (
                <div className="bg-muted rounded-lg p-3 min-h-[120px]">
                  <div className="whitespace-pre-wrap text-sm">{comment}</div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-3 min-h-[120px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Edit3 className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleEdit} variant={hasExistingComment ? "outline" : "default"}>
                  <Edit3 className="h-3 w-3 mr-2" />
                  {hasExistingComment ? "Edit Note" : "Add Note"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserCommentModal;
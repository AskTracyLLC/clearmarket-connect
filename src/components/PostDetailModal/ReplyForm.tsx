import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReplyFormProps {
  onAddReply?: (content: string) => void;
}

const ReplyForm = ({ onAddReply }: ReplyFormProps) => {
  const [replyText, setReplyText] = useState("");

  const handleAddReply = () => {
    if (replyText.trim()) {
      if (onAddReply) {
        onAddReply(replyText);
      } else {
        // In a real app, this would add the reply to the post
        console.log("Adding reply:", replyText);
      }
      setReplyText("");
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="font-medium text-foreground">Add a Reply</h4>
      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Share your thoughts or help..."
        className="min-h-[80px]"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleAddReply}
          disabled={!replyText.trim()}
          variant="hero"
        >
          Post Reply
        </Button>
      </div>
    </div>
  );
};

export default ReplyForm;
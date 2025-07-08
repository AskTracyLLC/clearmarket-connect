import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientInitials: string;
  recipientId: string;
}

const NewMessageModal = ({ isOpen, onClose, recipientName, recipientInitials, recipientId }: NewMessageModalProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${recipientName}.`,
    });

    setMessage("");
    setIsLoading(false);
    onClose();
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar>
              <AvatarFallback>{recipientInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{recipientName}</h4>
              <p className="text-sm text-muted-foreground">Field Rep</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Hi, I saw your profile and would like to connect regarding..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Keep your first message professional and specific about the work you need.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageModal;
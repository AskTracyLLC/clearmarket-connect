import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeletionConfirmationEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedUserEmail: string;
  deletedUserUsername: string;
}

export const DeletionConfirmationEmailModal = ({
  open,
  onOpenChange,
  deletedUserEmail,
  deletedUserUsername,
}: DeletionConfirmationEmailModalProps) => {
  const [subject, setSubject] = useState(`${deletedUserUsername} - Your user data has been deleted from ClearMarket`);
  const [body, setBody] = useState(
    `Hello,

This is confirmation that the following data and details associated with your ClearMarket account have been permanently deleted:

- Anonymous Username: ${deletedUserUsername}
- Email Address: ${deletedUserEmail}

All associated records have been removed in accordance with ClearMarket's data policy.

Thank you,
The ClearMarket Team`
  );
  const [cc, setCc] = useState("hello@useclearmarket.io");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-deletion-confirmation", {
        body: {
          toEmail: deletedUserEmail,
          subject,
          body,
          cc,
        },
      });

      if (error) throw error;

      toast.success("Deletion confirmation email sent successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending deletion confirmation:", error);
      toast.error("Failed to send deletion confirmation email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Deletion Confirmation Email</DialogTitle>
          <DialogDescription>
            Review and edit the deletion confirmation email before sending to {deletedUserEmail}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body"
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cc">CC</Label>
            <Input
              id="cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="CC email addresses"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

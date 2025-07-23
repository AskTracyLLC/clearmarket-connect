import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Mail, User } from "lucide-react";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent?: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  open,
  onOpenChange,
  onInviteSent
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteType, setInviteType] = useState<"email" | "username">("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Check daily invite limit
      const { data: canInvite } = await supabase.rpc('check_daily_invite_limit', {
        user_id_param: user.id
      });

      if (!canInvite) {
        toast.error("You've reached your daily invite limit (5 invites per day)");
        return;
      }

      // Prepare invite data
      const inviteData: any = {
        sender_id: user.id,
        recipient_email: inviteType === "email" ? email : null,
        recipient_username: inviteType === "username" ? username : null,
        personal_message: personalMessage.trim() || null
      };

      // If username provided, try to find the user
      if (inviteType === "username") {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('anonymous_username', username)
          .single();
        
        if (userData) {
          inviteData.recipient_id = userData.id;
        }
      }

      // Create connection request
      const { error: insertError } = await supabase
        .from('connection_requests')
        .insert(inviteData);

      if (insertError) throw insertError;

      // Increment daily invite count
      await supabase.rpc('increment_daily_invite_count', {
        user_id_param: user.id
      });

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-network-invitation', {
        body: {
          inviteType,
          recipientEmail: inviteType === "email" ? email : null,
          recipientUsername: inviteType === "username" ? username : null,
          personalMessage: personalMessage.trim() || null
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't block the invite if email fails
      }

      toast.success("Network invitation sent successfully!");
      
      // Reset form
      setEmail("");
      setUsername("");
      setPersonalMessage("");
      onOpenChange(false);
      onInviteSent?.();

    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (inviteType === "email") {
      return email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    } else {
      return username.trim();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite to Network
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={inviteType} onValueChange={(value) => setInviteType(value as "email" | "username")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                By Email
              </TabsTrigger>
              <TabsTrigger value="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                By Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-3">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter their email address"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="username" className="space-y-3">
              <div>
                <Label htmlFor="username">Anonymous Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., FieldRep#42 or Vendor#15"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter their anonymous username like "FieldRep#42" or "Vendor#15"
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add a personal note about why you'd like to connect..."
              maxLength={250}
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {personalMessage.length}/250 characters
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
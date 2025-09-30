import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AddToNetworkModalProps {
  repId: string;
  repInitials: string;
  onNetworkAdded: () => void;
}

interface ConnectionRequestValidation {
  can_send: boolean;
  reason: string | null;
  message: string;
  remaining_today?: number;
  existing_status?: string;
}

const AddToNetworkModal = ({ repId, repInitials, onNetworkAdded }: AddToNetworkModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [personalMessage, setPersonalMessage] = useState("");

  const handleAddToNetwork = async () => {
    if (!user) return;
    
    setIsAdding(true);
    
    try {
      // Validate request using database function
      const { data: validationResult, error: validationError } = await supabase
        .rpc('can_send_connection_request', {
          sender_user_id: user.id,
          recipient_user_id: repId
        });

      if (validationError) throw validationError;

      const validation = validationResult as unknown as ConnectionRequestValidation;

      if (!validation?.can_send) {
        toast({
          title: validation?.reason === 'daily_limit' 
            ? "Daily Limit Reached" 
            : "Cannot Send Request",
          description: validation?.message || "Unable to send connection request at this time.",
          variant: "destructive",
        });
        setIsAdding(false);
        return;
      }

      // Create connection request
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user.id,
          recipient_id: repId,
          personal_message: personalMessage || null,
          status: 'pending'
        });

      if (error) throw error;

      // Get recipient and sender details for email
      const { data: recipientData } = await supabase
        .from('users')
        .select('email, anonymous_username')
        .eq('id', repId)
        .single();

      const { data: senderData } = await supabase
        .from('users')
        .select('anonymous_username, role')
        .eq('id', user.id)
        .single();

      // Create in-app notification
      try {
        await supabase.from('notifications').insert({
          user_id: repId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: `${senderData?.anonymous_username || 'A vendor'} wants to connect with you${personalMessage ? ': "' + personalMessage.substring(0, 100) + (personalMessage.length > 100 ? '..."' : '"') : ''}`,
          read: false,
          target_id: user.id,
          target_type: 'user'
        });
      } catch (notifError) {
        console.error('Failed to create in-app notification:', notifError);
      }

      // Send email notification
      if (recipientData?.email && senderData) {
        try {
          await supabase.functions.invoke('send-connection-request-email', {
            body: {
              recipientEmail: recipientData.email,
              recipientUsername: recipientData.anonymous_username || 'User',
              senderUsername: senderData.anonymous_username || 'User',
              senderRole: senderData.role,
              personalMessage: personalMessage || undefined
            }
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the request if email fails
        }
      }

      toast({
        title: "Connection Request Sent!",
        description: validation?.remaining_today 
          ? `${repInitials} will be notified. You have ${validation.remaining_today} request${validation.remaining_today === 1 ? '' : 's'} remaining today.`
          : `${repInitials} will be notified of your request.`,
      });
      onNetworkAdded();
      setIsOpen(false);
      setPersonalMessage("");
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Failed to Send Request",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Add to My Network
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Connection Request to {repInitials}</DialogTitle>
          <DialogDescription>
            {repInitials} will need to accept your connection request before you can message them. 
            Add a personal message to introduce yourself (optional).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Hi! I'd like to connect and discuss potential coverage opportunities in your area..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {personalMessage.length}/500 characters
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToNetwork}
            disabled={isAdding}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isAdding ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToNetworkModal;
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
      // Check if request already exists
      const { data: existing } = await supabase
        .from('connection_requests')
        .select('id, status')
        .eq('sender_id', user.id)
        .eq('recipient_id', repId)
        .single();

      if (existing) {
        toast({
          title: "Request Already Sent",
          description: existing.status === 'pending' 
            ? `Your connection request to ${repInitials} is pending their response.`
            : `You already have a ${existing.status} connection request with ${repInitials}.`,
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

      toast({
        title: "Connection Request Sent!",
        description: `${repInitials} will be notified of your request. You'll be able to message them once they accept.`,
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
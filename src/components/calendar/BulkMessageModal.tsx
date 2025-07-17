import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Users, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NetworkContact {
  id: string;
  display_name: string;
  unlocked_user_id: string;
}

interface BulkMessageModalProps {
  trigger?: React.ReactNode;
}

const BulkMessageModal = ({ trigger }: BulkMessageModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState<"availability" | "emergency" | "custom">("availability");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [networkContacts, setNetworkContacts] = useState<NetworkContact[]>([]);
  const [area, setArea] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadNetworkContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_unlocks")
        .select(`
          unlocked_user_id,
          users!contact_unlocks_unlocked_user_id_fkey(id, display_name, anonymous_username)
        `)
        .eq("unlocker_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      const contacts = data?.map(item => ({
        id: item.users?.id || "",
        display_name: item.users?.display_name || item.users?.anonymous_username || "Anonymous User",
        unlocked_user_id: item.unlocked_user_id
      })) || [];
      
      setNetworkContacts(contacts);
    } catch (error: any) {
      toast({
        title: "Error loading contacts",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNetworkContacts();
    }
  }, [isOpen]);

  const generateContent = () => {
    switch (messageTemplate) {
      case "availability":
        const dateText = selectedDates.length > 0 
          ? selectedDates.map(d => format(d, "MMM d")).join(", ")
          : "[Date(s)]";
        return `I'll be in ${area || "[Area]"} on ${dateText} and available for work.`;
      
      case "emergency":
        const endDate = selectedDates.length > 0 ? format(selectedDates[0], "MMM d") : "[Date]";
        return `Emergency: I'm unavailable through ${endDate}. Please reassign anything due before then.`;
      
      default:
        return customContent;
    }
  };

  const generateSubject = () => {
    switch (messageTemplate) {
      case "availability":
        return `Available for Work - ${area || "Field Rep"}`;
      case "emergency":
        return "Emergency: Unavailable Notice";
      default:
        return customSubject;
    }
  };

  const handleSendMessage = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one contact to send the message to.",
        variant: "destructive",
      });
      return;
    }

    const subject = generateSubject();
    const content = generateContent();

    if (!subject || !content) {
      toast({
        title: "Message incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create bulk message record
      const { data: bulkMessage, error: messageError } = await supabase
        .from("bulk_messages")
        .insert({
          sender_id: user.id,
          message_template: messageTemplate,
          subject,
          content,
          area: messageTemplate === "availability" ? area : null,
          dates_mentioned: selectedDates.map(d => d.toISOString().split("T")[0])
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Insert recipients
      const recipients = selectedContacts.map(contactId => ({
        bulk_message_id: bulkMessage.id,
        recipient_id: contactId
      }));

      const { error: recipientError } = await supabase
        .from("bulk_message_recipients")
        .insert(recipients);

      if (recipientError) throw recipientError;

      toast({
        title: "Message sent!",
        description: `Your message was sent to ${selectedContacts.length} contact(s).`,
      });

      setIsOpen(false);
      // Reset form
      setSelectedContacts([]);
      setArea("");
      setSelectedDates([]);
      setCustomSubject("");
      setCustomContent("");
      setMessageTemplate("availability");

    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleAllContacts = () => {
    if (selectedContacts.length === networkContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(networkContacts.map(c => c.id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Network Alert
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Network Alert</DialogTitle>
          <DialogDescription>
            Send a message to your vendor network. Messages are sent individually (blind copy).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Template */}
          <div>
            <Label className="text-base font-medium">Message Type</Label>
            <RadioGroup value={messageTemplate} onValueChange={(value: any) => setMessageTemplate(value)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="availability" id="availability" />
                <Label htmlFor="availability">Availability Alert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency">Emergency Notice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom Message</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Template-specific fields */}
          {messageTemplate === "availability" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="area">Area/Location</Label>
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g., Downtown, North Side, etc."
                />
              </div>
              <div>
                <Label>Available Dates</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDates.length > 0 
                        ? `${selectedDates.length} date(s) selected`
                        : "Select dates"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={(dates) => setSelectedDates(dates || [])}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDates.map((date, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {format(date, "MMM d")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {messageTemplate === "emergency" && (
            <div>
              <Label>Unavailable Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDates.length > 0 
                      ? format(selectedDates[0], "PPP")
                      : "Select end date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDates[0]}
                    onSelect={(date) => setSelectedDates(date ? [date] : [])}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {messageTemplate === "custom" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="customSubject">Subject</Label>
                <Input
                  id="customSubject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label htmlFor="customContent">Message</Label>
                <Textarea
                  id="customContent"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Your message content"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Message Preview */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-sm font-medium">Message Preview:</Label>
            <div className="mt-2 space-y-2">
              <p className="font-medium text-sm">Subject: {generateSubject() || "Enter subject"}</p>
              <p className="text-sm">{generateContent() || "Enter message content"}</p>
            </div>
          </div>

          {/* Contact Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">Recipients ({selectedContacts.length})</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllContacts}
                disabled={networkContacts.length === 0}
              >
                {selectedContacts.length === networkContacts.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            {networkContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No network contacts found. Add vendors to your network first.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {networkContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`contact-${contact.id}`}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleContact(contact.id)}
                    />
                    <Label
                      htmlFor={`contact-${contact.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {contact.display_name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || selectedContacts.length === 0}
          >
            {loading ? "Sending..." : `Send to ${selectedContacts.length} Contact(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkMessageModal;

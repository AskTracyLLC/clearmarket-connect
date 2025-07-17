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
      // Get contact unlocks first
      const { data: unlocksData, error: unlocksError } = await supabase
        .from("contact_unlocks")
        .select("unlocked_user_id")
        .eq("unlocker_id", (await supabase.auth.getUser()).data.user?.id);

      if (unlocksError) throw unlocksError;

      // Get user data separately
      const userIds = unlocksData?.map(unlock => unlock.unlocked_user_id) || [];
      let usersData = [];
      
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, display_name, anonymous_username")
          .in("id", userIds);
        usersData = userData || [];
      }
      
      const contacts = unlocksData?.map(unlock => {
        const user = usersData.find(u => u.id === unlock.unlocked_user_id);
        return {
          id: unlock.unlocked_user_id,
          display_name: user?.display_name || user?.anonymous_username || "Anonymous User",
          unlocked_user_id: unlock.unlocked_user_id
        };
      }) || [];
      
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
          ? selectedDates.map(date => format(date, "EEEE, MMMM d")).join(", ")
          : "[dates]";
        
        return {
          subject: `Travel Schedule Update - ${area || "[Area]"} Coverage Available`,
          content: `Hi everyone,

I wanted to give you a quick update on my availability for ${area || "[your area]"}:

${dateText ? `Available: ${dateText}` : "Available: [Please specify dates]"}

${area ? `I'll be traveling through ${area} and can take on additional work.` : "I'll be in the area and can take on additional work."}

Please let me know if you have any assignments that need coverage.

Thanks,
[Your name]`
        };

      case "emergency":
        return {
          subject: "Emergency Coverage Change - Immediate Action Required",
          content: `Hi everyone,

I have an urgent schedule change that affects pending assignments:

${customContent || "[Please describe the situation and any necessary actions]"}

I apologize for any inconvenience and will work to minimize disruption.

Please contact me immediately if this affects any of your urgent assignments.

Thanks for your understanding,
[Your name]`
        };

      case "custom":
        return {
          subject: customSubject || "Network Update",
          content: customContent || ""
        };

      default:
        return { subject: "", content: "" };
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

    const { subject, content } = generateContent();
    
    if (!subject || !content) {
      toast({
        title: "Message incomplete",
        description: "Please complete all required fields before sending.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Here you would integrate with your messaging system
      // For now, we'll simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Message sent successfully",
        description: `Sent to ${selectedContacts.length} contacts`,
      });

      // Reset form
      setSelectedContacts([]);
      setArea("");
      setSelectedDates([]);
      setCustomSubject("");
      setCustomContent("");
      setIsOpen(false);

    } catch (error: any) {
      toast({
        title: "Failed to send message",
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
      setSelectedContacts(networkContacts.map(contact => contact.id));
    }
  };

  const { subject, content } = generateContent();

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Send Message to Network
          </DialogTitle>
          <DialogDescription>
            Send updates to your network of vendors about availability, schedule changes, or other important information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Message Setup */}
          <div className="space-y-6">
            {/* Message Template */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Message Type</Label>
              <RadioGroup value={messageTemplate} onValueChange={(value: any) => setMessageTemplate(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="availability" id="availability" />
                  <Label htmlFor="availability">Availability Update</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emergency" id="emergency" />
                  <Label htmlFor="emergency">Emergency/Schedule Change</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom Message</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Fields */}
            {messageTemplate === "availability" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="area">Coverage Area</Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., Cook County, Chicago Metro, etc."
                  />
                </div>
                
                <div>
                  <Label>Available Dates</Label>
                  <div className="flex gap-2 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Select Dates
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="multiple"
                          selected={selectedDates}
                          onSelect={(dates) => setSelectedDates(dates || [])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {selectedDates.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="secondary">
                          {format(date, "MMM d")}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <Label htmlFor="customContent">Message</Label>
                  <Textarea
                    id="customContent"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Enter your message"
                    rows={6}
                  />
                </div>
              </div>
            )}

            {(messageTemplate === "emergency") && (
              <div>
                <Label htmlFor="emergencyContent">Situation Description</Label>
                <Textarea
                  id="emergencyContent"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Describe the emergency or schedule change..."
                  rows={4}
                />
              </div>
            )}

            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Recipients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllContacts}
                >
                  {selectedContacts.length === networkContacts.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="max-h-48 overflow-y-auto border rounded p-3 space-y-2">
                {networkContacts.length > 0 ? (
                  networkContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={contact.id}
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                      />
                      <Label htmlFor={contact.id} className="cursor-pointer">
                        {contact.display_name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No network contacts found. Unlock contacts first to send messages.
                  </p>
                )}
              </div>
              
              {selectedContacts.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Message Preview */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Message Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/30 min-h-96">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Subject:</Label>
                  <p className="text-sm mt-1 p-2 bg-background rounded border">
                    {subject || "Subject will appear here..."}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Message:</Label>
                  <div className="text-sm mt-1 p-3 bg-background rounded border whitespace-pre-wrap min-h-48">
                    {content || "Message content will appear here..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={loading || selectedContacts.length === 0}>
            {loading ? "Sending..." : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkMessageModal;

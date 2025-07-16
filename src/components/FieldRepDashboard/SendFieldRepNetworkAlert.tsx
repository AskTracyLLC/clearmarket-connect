import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendFieldRepNetworkAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkSize: number;
}

const SendFieldRepNetworkAlert = ({ open, onOpenChange, networkSize }: SendFieldRepNetworkAlertProps) => {
  const [messageType, setMessageType] = useState('daily-location');
  const [area, setArea] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date()]);
  const [unavailableUntilDate, setUnavailableUntilDate] = useState<Date>();
  const [customMessage, setCustomMessage] = useState('');

  const { toast } = useToast();

  const handleSend = async () => {
    try {
      // TODO: Implement actual network alert sending logic
      console.log('Sending field rep network alert:', {
        messageType,
        area,
        selectedDates,
        customMessage
      });

      // Create calendar event for the network alert
      const messagePreview = getMessagePreview();
      const selectedDate = selectedDates[0] || new Date();
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to send alerts.",
          variant: "destructive",
        });
        return;
      }

      const { error: calendarError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.user.id,
          title: `Network Alert: ${messagePreview.subject}`,
          description: messagePreview.content,
          start_date: format(selectedDate, 'yyyy-MM-dd'),
          end_date: format(selectedDate, 'yyyy-MM-dd'),
          event_type: 'network_alert',
          event_visibility: 'private'
        });

      if (calendarError) {
        console.error('Error creating calendar event:', calendarError);
        toast({
          title: "Warning",
          description: "Alert sent but failed to save to calendar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Network alert sent and saved to your calendar.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error sending network alert:', error);
      toast({
        title: "Error",
        description: "Failed to send network alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setMessageType('daily-location');
    setArea('');
    setSelectedDates([new Date()]);
    setUnavailableUntilDate(undefined);
    setCustomMessage('');
    onOpenChange(false);
  };

  const getMessagePreview = () => {
    const userName = 'Field Rep'; // TODO: Get actual user name
    const userState = 'ST'; // TODO: Get actual user state
    const dateText = selectedDates.length > 0 ? format(selectedDates[0], 'PPP') : 'today';
    
    switch (messageType) {
      case 'daily-location':
        const baseMessage = `Today I'll be in ${area || '[Location]'}.`;
        const fullMessage = customMessage ? `${baseMessage}\n\n${customMessage}` : baseMessage;
        return {
          subject: `${userName} - Today I'll be in ${area || '[Location]'}`,
          content: fullMessage
        };
      case 'availability':
        return {
          subject: 'Available for Work - Field Rep',
          content: `I'll be in [${area || 'Area'}] on [${selectedDates.length > 0 ? selectedDates.map(d => format(d, 'M/d')).join(', ') : 'Date(s)'}] and available for work.`
        };
      case 'emergency':
        const emergencyContent = area || 'Emergency notice details will be entered here.';
        const unavailableText = unavailableUntilDate 
          ? `\n\nUnavailable until: ${format(unavailableUntilDate, 'PPP')}` 
          : '';
        return {
          subject: `Emergency Notice - ${userName} (${userState})`,
          content: emergencyContent + unavailableText
        };
      case 'custom':
        return {
          subject: 'Custom Message - Field Rep',
          content: 'Custom message content will be entered.'
        };
      default:
        return { subject: '', content: '' };
    }
  };

  const messagePreview = getMessagePreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Network Alert
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Send a message to your vendor network. Messages are sent individually (blind copy).
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Message Type</Label>
            <RadioGroup value={messageType} onValueChange={setMessageType} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily-location" id="daily-location" />
                <Label htmlFor="daily-location" className="cursor-pointer">Daily Location Update</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="availability" id="availability" />
                <Label htmlFor="availability" className="cursor-pointer">Availability Alert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency" className="cursor-pointer">Emergency Notice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">Custom Message</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Area/Location or Message Details */}
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium">
              {messageType === 'emergency' ? 'Message Details' : 'Area/Location'}
            </Label>
            <Input
              id="area"
              placeholder={messageType === 'emergency' ? 'Enter emergency details...' : 'e.g., Downtown, North Side, etc.'}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {messageType === 'daily-location' ? 'Date' : 'Available Dates'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    selectedDates.length === 0 && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDates.length > 0 
                    ? (messageType === 'daily-location' || messageType === 'emergency'
                        ? format(selectedDates[0], 'PPP')
                        : `${selectedDates.length} date(s) selected`)
                    : "Select dates"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {messageType === 'daily-location' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDates[0]}
                    onSelect={(date) => {
                      setSelectedDates(date ? [date] : [new Date()]);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                ) : messageType === 'emergency' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDates[0] || new Date()}
                    onSelect={(date) => {
                      setSelectedDates(date ? [date] : [new Date()]);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                ) : (
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Unavailable Until Date (Emergency Notice only) */}
          {messageType === 'emergency' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Unavailable Until Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !unavailableUntilDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {unavailableUntilDate ? format(unavailableUntilDate, 'PPP') : "Select unavailable until date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={unavailableUntilDate}
                    onSelect={setUnavailableUntilDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {unavailableUntilDate && (
                <p className="text-xs text-muted-foreground">
                  You will be marked as unavailable until {format(unavailableUntilDate, 'PPP')}
                </p>
              )}
            </div>
          )}

          {/* Custom Message for Daily Location Update */}
          {messageType === 'daily-location' && (
            <div className="space-y-2">
              <Label htmlFor="custom-message" className="text-sm font-medium">Additional Message (Optional)</Label>
              <Textarea
                id="custom-message"
                placeholder="Add any additional details about your availability..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full min-h-[80px]"
              />
            </div>
          )}

          {/* Message Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Message Preview:</Label>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Subject:</span> {messagePreview.subject}
              </div>
              <div className="text-sm">
                <span className="font-medium">Message:</span> {messagePreview.content}
              </div>
            </div>
          </div>

          {/* Recipients info */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Recipients (0)</div>
            <div className="mt-1">No network contacts found. Add vendors to your network first.</div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!area.trim() || selectedDates.length === 0}
              className="flex items-center gap-2"
            >
              Send to 0 Contact(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendFieldRepNetworkAlert;
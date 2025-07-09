import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SendNetworkAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkSize: number;
}

interface AlertFilters {
  states: string[];
  counties: string[];
  systems: string[];
  orderTypes: string[];
}

const SendNetworkAlertModal = ({ open, onOpenChange, networkSize }: SendNetworkAlertModalProps) => {
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [filters, setFilters] = useState<AlertFilters>({
    states: [],
    counties: [],
    systems: [],
    orderTypes: []
  });
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendAlert = async () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both subject and message body.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      let scheduledSendDate = null;
      if (isScheduled && scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':');
        scheduledSendDate = new Date(scheduledDate);
        scheduledSendDate.setHours(parseInt(hours), parseInt(minutes));
      }

      // Save alert to database
      const { data: alertData, error: alertError } = await supabase
        .from('vendor_network_alerts')
        .insert({
          vendor_id: userData.user.id,
          subject,
          message_body: messageBody,
          filters_used: filters as any,
          total_recipients: networkSize,
          scheduled_send_date: scheduledSendDate?.toISOString(),
          status: isScheduled ? 'scheduled' : 'draft'
        })
        .select()
        .single();

      if (alertError) throw alertError;

      // If not scheduled, send immediately
      if (!isScheduled) {
        const { error: sendError } = await supabase.functions.invoke('send-network-alert', {
          body: {
            alertId: alertData.id,
            subject,
            messageBody,
            filters
          }
        });

        if (sendError) throw sendError;

        toast({
          title: 'Alert Sent Successfully',
          description: `Your network alert has been sent to ${networkSize} field reps.`
        });
      } else {
        toast({
          title: 'Alert Scheduled',
          description: `Your alert has been scheduled for ${format(scheduledSendDate!, 'PPP p')}.`
        });
      }

      // Reset form
      setSubject('');
      setMessageBody('');
      setFilters({ states: [], counties: [], systems: [], orderTypes: [] });
      setScheduledDate(undefined);
      setScheduledTime('');
      setIsScheduled(false);
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error sending alert:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send alert. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Network Alert
          </DialogTitle>
          <DialogDescription>
            Send a blind-copied alert to your connected field reps. Recipients won't see who else received it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter alert subject..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Body *</Label>
            <Textarea
              id="message"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Enter your message..."
              rows={6}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {messageBody.length}/2000 characters
            </div>
          </div>

          <div className="space-y-4">
            <Label>Filters (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">States</Label>
                <Select onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  states: value ? [value] : []
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Systems</Label>
                <Select onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  systems: value ? [value] : []
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All systems" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CoreLogic">CoreLogic</SelectItem>
                    <SelectItem value="Clear Capital">Clear Capital</SelectItem>
                    <SelectItem value="ServiceLink">ServiceLink</SelectItem>
                    <SelectItem value="AMC">AMC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="schedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule for later
              </Label>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">
              This alert will be sent to <strong>{networkSize}</strong> connected field reps.
              All emails are blind-copied for privacy.
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendAlert} disabled={isLoading}>
              {isLoading ? 'Sending...' : isScheduled ? 'Schedule Alert' : 'Send Alert'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendNetworkAlertModal;
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, X } from 'lucide-react';

interface SendVendorNetworkAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkSize: number;
}

const SendVendorNetworkAlert = ({ open, onOpenChange, networkSize }: SendVendorNetworkAlertProps) => {
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [scheduleForLater, setScheduleForLater] = useState(false);

  const handleSend = () => {
    // TODO: Implement send logic
    console.log('Sending field rep network alert:', {
      subject,
      messageBody,
      selectedState,
      selectedSystem,
      scheduleForLater
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSubject('');
    setMessageBody('');
    setSelectedState('');
    setSelectedSystem('');
    setScheduleForLater(false);
    onOpenChange(false);
  };

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
            Send a blind-copied alert to your connected field reps. Recipients won't see who else received it.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Enter alert subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message Body <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="text-right text-xs text-muted-foreground">
              {messageBody.length}/2000 characters
            </div>
          </div>

          {/* Filters (Optional) */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Filters (Optional)</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* States */}
              <div className="space-y-2">
                <Label htmlFor="states" className="text-sm">States</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Systems */}
              <div className="space-y-2">
                <Label htmlFor="systems" className="text-sm">Systems</Label>
                <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                  <SelectTrigger>
                    <SelectValue placeholder="All systems" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All systems</SelectItem>
                    <SelectItem value="corelogic">CoreLogic</SelectItem>
                    <SelectItem value="clear-capital">Clear Capital</SelectItem>
                    <SelectItem value="servicelink">ServiceLink</SelectItem>
                    <SelectItem value="solidifi">Solidifi</SelectItem>
                    <SelectItem value="amc">AMC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule for later */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="schedule"
              checked={scheduleForLater}
              onCheckedChange={(checked) => setScheduleForLater(checked === true)}
            />
            <Label htmlFor="schedule" className="text-sm cursor-pointer">
              Schedule for later
            </Label>
          </div>

          {/* Recipients info */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            This alert will be sent to <span className="font-medium text-foreground">{networkSize}</span> connected field reps. All emails are blind-copied for privacy.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!subject.trim() || !messageBody.trim()}
              className="flex items-center gap-2"
            >
              Send Alert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendVendorNetworkAlert;
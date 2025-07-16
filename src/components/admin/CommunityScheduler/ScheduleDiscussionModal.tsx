import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar as CalendarIcon, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DiscussionTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  post_type: string;
  tags: string[];
  priority: number;
}

interface ScheduleDiscussionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ScheduleDiscussionModal = ({ open, onOpenChange, onSuccess }: ScheduleDiscussionModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DiscussionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DiscussionTemplate | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [priority, setPriority] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      // Reset form
      setSelectedTemplate(null);
      setScheduledDate(undefined);
      setScheduledTime("09:00");
      setPriority(5);
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_templates')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load discussion templates",
        variant: "destructive"
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedTemplate || !scheduledDate || !user) {
      toast({
        title: "Error",
        description: "Please select a template and date",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const finalDate = new Date(scheduledDate);
      finalDate.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('scheduled_discussion_posts')
        .insert({
          admin_user_id: user.id,
          discussion_template_id: selectedTemplate.id,
          scheduled_date: finalDate.toISOString(),
          priority,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Discussion scheduled for ${format(finalDate, "PPP 'at' p")}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling discussion:', error);
      toast({
        title: "Error", 
        description: "Failed to schedule discussion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Safety': 'bg-red-100 text-red-800 border-red-200',
      'Process': 'bg-blue-100 text-blue-800 border-blue-200', 
      'Documentation': 'bg-green-100 text-green-800 border-green-200',
      'Technology': 'bg-purple-100 text-purple-800 border-purple-200',
      'Business': 'bg-orange-100 text-orange-800 border-orange-200',
      'Quality': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Regional': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Community Discussion</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Discussion Template</Label>
              <p className="text-sm text-muted-foreground">Choose from pre-built discussion starters</p>
            </div>

            {loadingTemplates ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedTemplate?.id === template.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.title}</CardTitle>
                        <Badge className={cn("text-xs", getCategoryColor(template.category))}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">Priority: {template.priority}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling Options */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Schedule Settings</Label>
              <p className="text-sm text-muted-foreground">When should this discussion be posted?</p>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
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
                <PopoverContent className="w-auto p-0">
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

            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Priority Slider */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-10)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="priority"
                  type="range"
                  min="1"
                  max="10"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{priority}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher priority discussions are posted even if similar topics exist
              </p>
            </div>

            {/* Preview */}
            {selectedTemplate && scheduledDate && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <strong>Title:</strong> {selectedTemplate.title}
                  </p>
                  <p className="text-sm">
                    <strong>Scheduled:</strong> {format(scheduledDate, "PPP")} at {scheduledTime}
                  </p>
                  <p className="text-sm">
                    <strong>Category:</strong> {selectedTemplate.category}
                  </p>
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={!selectedTemplate || !scheduledDate || isLoading}
          >
            {isLoading ? "Scheduling..." : "Schedule Discussion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
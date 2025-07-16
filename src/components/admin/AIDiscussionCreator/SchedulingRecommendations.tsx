import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  Zap,
  Medal,
  AlertTriangle,
  CheckCircle,
  Users,
  MessageSquare
} from "lucide-react";
import { addDays, format, isSameDay } from "date-fns";

interface SchedulingRecommendationsProps {
  analysis: {
    conflictScore: number;
    recommendations: {
      action: 'post_now' | 'schedule' | 'revise';
      reasoning: string;
      recommendedDate?: string;
    };
  };
}

interface SchedulingOption {
  date: Date;
  rank: 1 | 2 | 3;
  label: string;
  engagement: 'High' | 'Medium-High' | 'Medium' | 'Low';
  conflicts: 'None' | 'Minor' | 'Moderate' | 'High';
  reasoning: string;
  icon: typeof Medal | typeof CheckCircle | typeof AlertTriangle;
  iconColor: string;
}

export const SchedulingRecommendations = ({ analysis }: SchedulingRecommendationsProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate scheduling options based on conflict analysis
  const generateSchedulingOptions = (): SchedulingOption[] => {
    const today = new Date();
    const options: SchedulingOption[] = [];

    // Option 1: Optimal date (based on conflict score)
    const optimalDays = analysis.conflictScore >= 0.7 ? 14 : analysis.conflictScore >= 0.4 ? 7 : 3;
    const optimalDate = addDays(today, optimalDays);
    
    options.push({
      date: optimalDate,
      rank: 1,
      label: "Optimal Date",
      engagement: analysis.conflictScore < 0.3 ? 'High' : 'Medium-High',
      conflicts: 'None',
      reasoning: `No conflicts detected. ${analysis.conflictScore < 0.3 ? 'High engagement expected' : 'Good engagement likely'} based on topic uniqueness.`,
      icon: Medal,
      iconColor: "text-yellow-600"
    });

    // Option 2: Alternative date
    const altDate = addDays(today, Math.max(optimalDays + 3, 5));
    options.push({
      date: altDate,
      rank: 2,
      label: "Alternative",
      engagement: 'Medium-High',
      conflicts: analysis.conflictScore > 0.4 ? 'Minor' : 'None',
      reasoning: "Alternative timing with solid engagement potential. Provides additional buffer from similar content.",
      icon: CheckCircle,
      iconColor: "text-green-600"
    });

    // Option 3: Post immediately (if conflict score allows)
    if (analysis.conflictScore < 0.6) {
      options.push({
        date: today,
        rank: 3,
        label: "Post Immediately",
        engagement: analysis.conflictScore < 0.3 ? 'High' : 'Medium',
        conflicts: analysis.conflictScore > 0.3 ? 'Minor' : 'None',
        reasoning: analysis.conflictScore < 0.3 
          ? "Great topic with no conflicts. Ready for immediate posting!" 
          : "Some overlap with recent content but still viable for immediate posting.",
        icon: Zap,
        iconColor: "text-blue-600"
      });
    }

    return options;
  };

  const schedulingOptions = generateSchedulingOptions();

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium-High': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConflictColor = (conflicts: string) => {
    switch (conflicts) {
      case 'None': return 'text-green-600';
      case 'Minor': return 'text-yellow-600';
      case 'Moderate': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const handleScheduleForDate = (date: Date) => {
    // This would trigger the scheduling logic
    console.log('Scheduling for:', date);
  };

  const handleCustomDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Recommended Posting Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scheduling Options */}
        <div className="space-y-3">
          {schedulingOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card key={option.rank} className="border-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-5 w-5 ${option.iconColor}`} />
                      <div>
                        <h4 className="font-medium text-sm">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.date.getTime() === new Date().setHours(0,0,0,0) 
                            ? 'Today' 
                            : format(option.date, 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        className={`text-xs ${getEngagementColor(option.engagement)}`}
                        variant="outline"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {option.engagement}
                      </Badge>
                      <span className={`text-xs ${getConflictColor(option.conflicts)}`}>
                        {option.conflicts} conflicts
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{option.reasoning}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-muted/30">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        9:00 AM (optimal time)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        ~{option.engagement === 'High' ? '25+' : option.engagement === 'Medium-High' ? '15-25' : '10-20'} responses expected
                      </span>
                    </div>
                    <Button
                      onClick={() => handleScheduleForDate(option.date)}
                      size="sm"
                      variant={option.rank === 1 ? "default" : "outline"}
                      className="text-xs"
                    >
                      {option.date.getTime() === new Date().setHours(0,0,0,0) 
                        ? 'Post Now' 
                        : 'Schedule'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Date Picker */}
        <div className="pt-3 border-t border-muted">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Custom Date</h4>
              <p className="text-xs text-muted-foreground">
                Choose your own posting date
              </p>
            </div>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCustomDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedDate && (
            <Alert className="mt-3 border-blue-200 bg-blue-50">
              <CalendarIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Custom date selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                  <Button 
                    onClick={() => handleScheduleForDate(selectedDate)}
                    size="sm" 
                    className="text-xs"
                  >
                    Schedule for This Date
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Scheduling Tips */}
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Tip:</strong> Monday mornings (9-10 AM) and Thursday afternoons (2-3 PM) 
            typically see the highest engagement in the field rep community. 
            Avoid Friday afternoons and weekends for maximum visibility.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
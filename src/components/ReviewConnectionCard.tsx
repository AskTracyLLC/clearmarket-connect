import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface ReviewConnectionCardProps {
  connection: {
    id: number;
    initials: string;
    name: string;
    lastWorked: string;
    projects: number;
    canReview: boolean;
    daysUntilNextReview: number;
    nextReviewDate: Date;
  };
}

const ReviewConnectionCard = ({ connection }: ReviewConnectionCardProps) => {
  return (
    <div className={`p-3 border rounded-lg ${
      connection.canReview ? 'border-border' : 'border-muted bg-muted/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="font-semibold text-primary text-sm">{connection.initials}</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{connection.name}</div>
            <div className="text-xs text-muted-foreground">
              {connection.projects} projects • {connection.lastWorked}
            </div>
            {!connection.canReview && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>Available in {connection.daysUntilNextReview} day{connection.daysUntilNextReview !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button 
            size="sm" 
            variant={connection.canReview ? "outline" : "outline"}
            disabled={!connection.canReview}
          >
            {connection.canReview ? "Rate & Earn" : "Reviewed Recently"}
          </Button>
          {!connection.canReview && (
            <div className="text-xs text-muted-foreground">
              {format(connection.nextReviewDate, 'MMM d')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewConnectionCard;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, TrendingUp } from "lucide-react";

interface TipItem {
  id: string;
  text: string;
  completed: boolean;
  points: number;
}

const tipItems: TipItem[] = [
  { id: "bio", text: "Complete your bio", completed: true, points: 10 },
  { id: "verified", text: "Get verified", completed: false, points: 25 },
  { id: "community", text: "Post in the community", completed: false, points: 15 },
  { id: "colleague", text: "Invite a colleague", completed: false, points: 20 },
  { id: "photo", text: "Add profile photo", completed: false, points: 10 }
];

const TrustBoostTips = () => {
  const completedCount = tipItems.filter(item => item.completed).length;
  const totalPoints = tipItems.reduce((sum, item) => sum + (item.completed ? item.points : 0), 0);
  const maxPoints = tipItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = (completedCount / tipItems.length) * 100;

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Boost Your Profile
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {tipItems.length} completed
          </span>
          <span className="font-semibold text-primary">
            {totalPoints}/{maxPoints} pts
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tipItems.map((tip) => (
          <div key={tip.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            {tip.completed ? (
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            
            <span className={`flex-1 text-sm ${tip.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {tip.text}
            </span>
            
            <span className="text-xs text-primary font-medium">
              +{tip.points}
            </span>
          </div>
        ))}

        {progressPercentage === 100 && (
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-success font-medium text-sm mb-2">
              <CheckCircle className="h-4 w-4" />
              Profile Complete!
            </div>
            <p className="text-xs text-success">
              Congratulations! You've earned {maxPoints} bonus credits for completing your profile.
            </p>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full mt-4">
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrustBoostTips;
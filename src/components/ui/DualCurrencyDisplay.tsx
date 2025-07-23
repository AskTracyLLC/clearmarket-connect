import { Star, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DualCurrencyDisplayProps {
  repPoints: number;
  clearCredits: number;
  showLabels?: boolean;
  layout?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
}

export const DualCurrencyDisplay = ({
  repPoints,
  clearCredits,
  showLabels = true,
  layout = "horizontal",
  size = "md"
}: DualCurrencyDisplayProps) => {
  const iconSize = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";
  const textSize = size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg";
  const containerClass = layout === "horizontal" ? "flex items-center gap-4" : "space-y-2";

  return (
    <div className={containerClass}>
      {/* Rep Points */}
      <div className="flex items-center gap-2">
        <Star className={`${iconSize} text-primary`} />
        <div className="flex flex-col">
          <span className={`${textSize} font-medium`}>{repPoints}</span>
          {showLabels && (
            <span className="text-xs text-muted-foreground">Rep Points</span>
          )}
        </div>
      </div>

      {/* ClearCredits */}
      <div className="flex items-center gap-2">
        <Coins className={`${iconSize} text-accent`} />
        <div className="flex flex-col">
          <span className={`${textSize} font-medium`}>{clearCredits}</span>
          {showLabels && (
            <span className="text-xs text-muted-foreground">ClearCredits</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const DualCurrencyCard = ({
  repPoints,
  clearCredits,
  title = "Your Balance"
}: {
  repPoints: number;
  clearCredits: number;
  title?: string;
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">{title}</h3>
        <DualCurrencyDisplay
          repPoints={repPoints}
          clearCredits={clearCredits}
          layout="vertical"
          size="lg"
        />
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>Rep Points: Earned through community participation</p>
          <p>ClearCredits: Purchase for premium features</p>
        </div>
      </CardContent>
    </Card>
  );
};
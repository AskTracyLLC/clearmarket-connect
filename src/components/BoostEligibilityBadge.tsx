import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";

interface BoostEligibilityBadgeProps {
  isEligible: boolean;
  trustScore?: number;
  communityScore?: number;
  className?: string;
}

const BoostEligibilityBadge = ({ 
  isEligible, 
  trustScore = 0, 
  communityScore = 0, 
  className 
}: BoostEligibilityBadgeProps) => {
  if (isEligible) {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
              🔼 Eligible for Boosting
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your profile meets the criteria to appear higher in search results.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <div className="font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2">
            ⚠️ Not Eligible for Boosting
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            Earn credits and improve your Trust Score to boost your visibility.
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-2 space-y-1">
            <div>Trust Score: {trustScore}/100 (minimum 75 required)</div>
            <div>Community Score: {communityScore}/100 (minimum 50 required)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoostEligibilityBadge;
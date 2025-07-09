import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle } from "lucide-react";
import BoostProfileModal from "./BoostProfileModal";

interface BoostEligibilityBadgeProps {
  trustScore: number;
  profileComplete: number;
  onBoostComplete?: () => void;
}

const BoostEligibilityBadge = ({ trustScore, profileComplete, onBoostComplete }: BoostEligibilityBadgeProps) => {
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const isEligible = trustScore >= 80 && profileComplete >= 100;

  return (
    <>
      <div className="flex items-center gap-2 p-3 rounded-lg border">
        {isEligible ? (
          <>
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                🔼 Eligible for Boosting
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Your profile meets the criteria to appear higher in search results.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setBoostModalOpen(true)}
              className="ml-2"
            >
              Boost Profile
            </Button>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                ⚠️ Not Eligible for Boosting
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Earn credits and improve your Trust Score to boost your visibility.
              </p>
            </div>
          </>
        )}
      </div>

      <BoostProfileModal
        open={boostModalOpen}
        onOpenChange={setBoostModalOpen}
        trustScore={trustScore}
        profileComplete={profileComplete}
        onBoostComplete={onBoostComplete}
      />
    </>
  );
};

export default BoostEligibilityBadge;
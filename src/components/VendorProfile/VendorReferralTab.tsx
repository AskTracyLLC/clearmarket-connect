import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const VendorReferralTab = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Referral program coming soon! Invite field reps to join your network and earn rewards.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VendorReferralTab;
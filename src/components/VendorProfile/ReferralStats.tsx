import { Card, CardContent } from "@/components/ui/card";
import { Gift, CheckCircle, Clock } from "lucide-react";
import { VendorProfile } from "@/data/mockVendorData";

interface ReferralStatsProps {
  vendor: VendorProfile;
}

const ReferralStats = ({ vendor }: ReferralStatsProps) => {
  const confirmedReferrals = vendor.referrals.filter(ref => ref.status === 'confirmed').length;
  const pendingReferrals = vendor.referrals.filter(ref => ref.status === 'pending').length;
  const totalCreditsEarned = vendor.referrals.filter(ref => ref.creditEarned).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCreditsEarned}</p>
              <p className="text-sm text-muted-foreground">Credits Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{confirmedReferrals}</p>
              <p className="text-sm text-muted-foreground">Confirmed Referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingReferrals}</p>
              <p className="text-sm text-muted-foreground">Pending Referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralStats;
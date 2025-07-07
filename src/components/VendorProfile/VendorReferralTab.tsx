import { mockCurrentVendor } from "@/data/mockVendorData";
import ReferralStats from "./ReferralStats";
import ReferralInfo from "./ReferralInfo";
import SendReferralEmail from "./SendReferralEmail";
import ReferralTrackingTable from "./ReferralTrackingTable";

const VendorReferralTab = () => {
  return (
    <div className="space-y-6">
      <ReferralStats vendor={mockCurrentVendor} />
      <ReferralInfo />
      <SendReferralEmail />
      <ReferralTrackingTable />
    </div>
  );
};

export default VendorReferralTab;
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Gift, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle
} from "lucide-react";
import { mockCurrentVendor, confirmReferral } from "@/data/mockVendorData";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ReferralTrackingTable = () => {
  const { toast } = useToast();

  const handleConfirmReferral = (referralId: string) => {
    const success = confirmReferral(referralId);
    if (success) {
      toast({
        title: "Referral Confirmed!",
        description: "You've earned 1 credit and the rep has been added to your network.",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'signed_up':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'signed_up':
        return 'Signed Up';
      case 'confirmed':
        return 'Confirmed';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'signed_up':
        return 'default';
      case 'confirmed':
        return 'default';
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Tracking ({mockCurrentVendor.referrals.length} referrals)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockCurrentVendor.referrals.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Referrals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your referral link with field reps to start earning credits when they join.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Referred</TableHead>
                <TableHead>Credit Earned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCurrentVendor.referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary text-sm">{referral.repInitials}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{referral.repName}</p>
                        <p className="text-sm text-muted-foreground">{referral.repInitials}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(referral.status)}
                      <Badge variant={getStatusBadgeVariant(referral.status)} className="text-xs">
                        {getStatusLabel(referral.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(referral.dateReferred, { addSuffix: true })}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {referral.creditEarned ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        ✅ Yes (1 credit)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        ❌ No
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {referral.status === 'signed_up' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConfirmReferral(referral.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Confirm
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        {referral.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralTrackingTable;
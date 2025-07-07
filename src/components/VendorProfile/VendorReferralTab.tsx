import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Copy, 
  Gift, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  Plus,
  Mail,
  UserCheck
} from "lucide-react";
import { mockCurrentVendor, generateReferralLink, confirmReferral, addReferral } from "@/data/mockVendorData";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const VendorReferralTab = () => {
  const { toast } = useToast();
  const [newRepName, setNewRepName] = useState("");
  const [newRepEmail, setNewRepEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("Join Our Network - Invitation from " + mockCurrentVendor.name);
  const [emailBody, setEmailBody] = useState(`Hi there,

I'd like to invite you to join our network on ClearMarket. We've been impressed with your work and would love to collaborate on future projects.

ClearMarket is a platform that connects vendors with trusted field representatives, making it easier for us to work together on inspection projects.

To join, simply use my referral code: ${mockCurrentVendor.referralCode}

Or click this link: ${generateReferralLink()}

Looking forward to working with you!

Best regards,
${mockCurrentVendor.name}`);

  const copyReferralLink = () => {
    const link = generateReferralLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(mockCurrentVendor.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleConfirmReferral = (referralId: string) => {
    const success = confirmReferral(referralId);
    if (success) {
      toast({
        title: "Referral Confirmed!",
        description: "You've earned 1 credit and the rep has been added to your network.",
      });
    }
  };

  // Check if email already exists in system (mock function)
  const checkEmailExists = (email: string): boolean => {
    // Mock existing emails - in real app, this would be an API call
    const existingEmails = ["jane.davis@email.com", "mike.rodriguez@email.com"];
    return existingEmails.includes(email.toLowerCase());
  };

  const handleSendReferral = () => {
    if (!newRepName.trim() || !newRepEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both rep name and email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRepEmail.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check if email exists in system
    if (checkEmailExists(newRepEmail.trim())) {
      // Add directly to network instead of referral
      toast({
        title: "User Found!",
        description: "This user is already in ClearMarket. Adding to your network instead.",
      });
      // Mock adding to network
      setNewRepName("");
      setNewRepEmail("");
      return;
    }

    // Show email customization modal
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    // Mock sending email
    const repInitials = newRepName.split(' ').map(n => n[0]).join('.') + '.';
    addReferral(newRepName.trim(), repInitials);
    
    setShowEmailModal(false);
    setNewRepName("");
    setNewRepEmail("");
    
    toast({
      title: "Referral Email Sent!",
      description: `Invitation email sent to ${newRepEmail}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'signed_up':
        return <Users className="h-4 w-4 text-blue-600" />;
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

  const confirmedReferrals = mockCurrentVendor.referrals.filter(ref => ref.status === 'confirmed').length;
  const pendingReferrals = mockCurrentVendor.referrals.filter(ref => ref.status === 'pending').length;
  const totalCreditsEarned = mockCurrentVendor.referrals.filter(ref => ref.creditEarned).length;

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
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

      {/* Referral Link & Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Your Referral Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-link">Referral Link</Label>
            <div className="flex gap-2">
              <Input
                id="referral-link"
                value={generateReferralLink()}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referral-code">Referral Code</Label>
            <div className="flex gap-2">
              <Input
                id="referral-code"
                value={mockCurrentVendor.referralCode}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Referral Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Referral Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rep-name">Rep Name</Label>
              <Input
                id="rep-name"
                value={newRepName}
                onChange={(e) => setNewRepName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rep-email">Email Address</Label>
              <Input
                id="rep-email"
                type="email"
                value={newRepEmail}
                onChange={(e) => setNewRepEmail(e.target.value)}
                placeholder="john.doe@email.com"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSendReferral} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                SEND referral email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Customization Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Referral Email</DialogTitle>
            <DialogDescription>
              Review and customize the email before sending to {newRepEmail}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Tracking Table */}
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
    </div>
  );
};

export default VendorReferralTab;
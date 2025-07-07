import { useState } from "react";
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
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCurrentVendor, generateReferralLink, addReferral } from "@/data/mockVendorData";

const SendReferralEmail = () => {
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

  return (
    <>
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
    </>
  );
};

export default SendReferralEmail;
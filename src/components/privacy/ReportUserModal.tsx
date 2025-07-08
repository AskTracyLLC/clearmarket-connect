import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserName: string;
  reportedUserInitials: string;
  reportedUserId: string;
}

const ReportUserModal = ({ isOpen, onClose, reportedUserName, reportedUserInitials, reportedUserId }: ReportUserModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reportReasons = [
    { value: "inappropriate-content", label: "Inappropriate content or behavior" },
    { value: "spam", label: "Spam or unwanted messages" },
    { value: "fake-profile", label: "Fake or misleading profile" },
    { value: "unprofessional", label: "Unprofessional conduct" },
    { value: "harassment", label: "Harassment or abuse" },
    { value: "fraud", label: "Fraud or scam" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast({
        title: "Missing Information",
        description: "Please select a reason for reporting.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Report Submitted",
      description: "Thank you for your report. Our team will review it within 24 hours.",
    });

    setReason("");
    setDescription("");
    setIsLoading(false);
    onClose();
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Report User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are reporting <strong>{reportedUserName}</strong>. False reports may result in restrictions on your account.
            </AlertDescription>
          </Alert>

          {/* Report Reason */}
          <div className="space-y-3">
            <Label>Reason for reporting *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="space-y-2">
                {reportReasons.map((reportReason) => (
                  <div key={reportReason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                    <Label htmlFor={reportReason.value} className="text-sm cursor-pointer">
                      {reportReason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide any additional context that might help us review this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!reason || isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserModal;
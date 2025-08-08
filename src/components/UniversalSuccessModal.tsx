import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UniversalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  userType: "field-rep" | "vendor" | string;
  signupType?: "prelaunch" | "field-rep-direct" | "vendor-direct" | "beta-register";
}

export const UniversalSuccessModal: React.FC<UniversalSuccessModalProps> = ({
  isOpen,
  onClose,
  username,
  userType,
  signupType = "prelaunch",
}) => {
  const roleDisplay = userType === "field-rep" ? "Field Representative" : userType === "vendor" ? "Vendor" : "User";
  const nextSteps = signupType === "prelaunch"
    ? "Check your email for beta access when we launch!"
    : signupType === "beta-register"
    ? "Check your email for your login credentials and complete your registration."
    : "Check your email for access instructions and next steps.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to ClearMarket!</DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-muted-foreground">
              You've been successfully added as a {roleDisplay}!
            </p>
            <p className="text-lg font-semibold mt-2">
              Your username: <span className="text-primary">{username}</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">📧 {nextSteps}</p>
            <p className="text-xs text-muted-foreground">
              Email should arrive within 5 minutes. Check spam folder if needed.
            </p>
          </div>
          <Button onClick={onClose} className="w-full" variant="default">
            Got it! I'll check my email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalSuccessModal;

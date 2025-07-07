import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Star, Users } from "lucide-react";
import { mockConnections } from "@/data/mockData";
import ReviewConnectionCard from "./ReviewConnectionCard";

interface UnlockContactModalProps {
  repInitials: string;
}

const UnlockContactModal = ({ repInitials }: UnlockContactModalProps) => {
  const [modalView, setModalView] = useState<"main" | "earn-credits" | "review-connections" | "referral-code">("main");

  return (
    <DialogContent className="sm:max-w-md">
      {modalView === "main" && (
        <>
          <DialogHeader>
            <DialogTitle>Unlock Contact Information</DialogTitle>
            <DialogDescription>
              Get access to {repInitials}'s contact details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-center text-foreground">
                <span className="font-semibold">Unlock contact for 3 credits</span>
              </p>
              <p className="text-center text-muted-foreground text-sm mt-1">
                Not enough credits? Earn by reviews, referrals, or purchase more.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setModalView("earn-credits")}
              >
                Earn Credits
              </Button>
              <Button variant="hero" className="w-full">
                Purchase Credits
              </Button>
            </div>
          </div>
        </>
      )}

      {modalView === "earn-credits" && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0"
                onClick={() => setModalView("main")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Earn Credits
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to earn credits
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                className="w-full p-4 h-auto flex-col gap-2"
                onClick={() => setModalView("review-connections")}
              >
                <Star className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">Review Connections</div>
                  <div className="text-xs text-muted-foreground">Rate Field Reps you've worked with</div>
                  <div className="text-xs text-primary font-medium">+1 credit per review</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full p-4 h-auto flex-col gap-2"
                onClick={() => setModalView("referral-code")}
              >
                <Users className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">Share Referral Code</div>
                  <div className="text-xs text-muted-foreground">Invite new users to the platform</div>
                  <div className="text-xs text-primary font-medium">+2 credits per successful referral</div>
                </div>
              </Button>
            </div>
          </div>
        </>
      )}

      {modalView === "review-connections" && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0"
                onClick={() => setModalView("earn-credits")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Review Connections
            </DialogTitle>
            <DialogDescription>
              Rate Field Reps you've previously worked with
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {mockConnections.map((connection) => (
              <ReviewConnectionCard key={connection.id} connection={connection} />
            ))}
            
            {mockConnections.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No connections to review yet.</p>
                <p className="text-sm">Work with Field Reps to unlock review opportunities.</p>
              </div>
            )}
          </div>
        </>
      )}

      {modalView === "referral-code" && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0"
                onClick={() => setModalView("earn-credits")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Share Referral Code
            </DialogTitle>
            <DialogDescription>
              Invite new users and earn credits
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Your Referral Code</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 p-2 bg-background border rounded text-center font-mono">
                  VENDOR-ABC123
                </div>
                <Button size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="font-medium">How it works:</div>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Share your code with new users</li>
                <li>• They sign up and complete profile setup</li>
                <li>• Once they make their first connection, you earn 2 credits</li>
              </ul>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-xs text-orange-800">
                <strong>Important:</strong> Credits are awarded only after successful verification. 
                Fake accounts will not generate credits.
              </div>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  );
};

export default UnlockContactModal;
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Lock, Unlock, Shield, Key, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isRepInNetwork, hasCreditsToUnlock, unlockRepContact, mockCurrentVendor } from "@/data/mockVendorData";
import UnlockContactModal from "./UnlockContactModal";

interface VendorResultCardProps {
  rep: {
    id: number;
    initials: string;
    distance: string;
    platforms: string[];
    inspectionTypes: string[];
    pricing: string;
    abcRequired: boolean;
    hudKeyRequired: boolean;
    hudKeyCode?: string;
  };
}

const VendorResultCard = ({ rep }: VendorResultCardProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const inNetwork = isRepInNetwork(rep.id);
  const canUnlock = hasCreditsToUnlock();
  
  const handleUnlock = async () => {
    if (!canUnlock) {
      toast({
        title: "No Credits Available",
        description: "You need credits to unlock contact information.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = unlockRepContact(rep.id, rep.initials);
    
    if (success) {
      toast({
        title: "Contact Unlocked!",
        description: `${rep.initials} has been added to your network. Contact info is now visible.`,
      });
    } else {
      toast({
        title: "Unlock Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsUpdating(false);
  };

  return (
    <Card className="hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            {/* Rep Info Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-primary">{rep.initials}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{rep.initials}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-3 w-3" />
                    <span>{rep.distance}</span>
                  </div>
                  {inNetwork && (
                    <Badge variant="outline" className="flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      In Your Network
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information - Conditional Display */}
            {inNetwork && (
              <div className="space-y-1 p-3 bg-primary/5 rounded-lg border">
                <Label className="text-sm text-muted-foreground">Contact Information:</Label>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Email: {rep.initials.toLowerCase().replace('.', '')}@email.com</p>
                  <p className="text-sm font-medium text-foreground">Phone: (555) 123-4567</p>
                </div>
              </div>
            )}

            {/* Platforms */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Platforms:</Label>
              <div className="flex flex-wrap gap-2">
                {rep.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Certifications & Keys */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Certifications & Keys:</Label>
              <div className="flex flex-wrap gap-2">
                {rep.abcRequired && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    ABC# Certified
                  </Badge>
                )}
                {rep.hudKeyRequired && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    HUD Key {rep.hudKeyCode && `(${rep.hudKeyCode})`}
                  </Badge>
                )}
              </div>
            </div>

            {/* Inspection Types */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Inspection Types:</Label>
              <div className="flex flex-wrap gap-2">
                {rep.inspectionTypes.map((type) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Pricing:</Label>
              <span className="text-sm font-medium text-foreground">{rep.pricing}</span>
            </div>
          </div>

          {/* Action Button - Conditional */}
          <div className="flex flex-col items-end gap-2">
            {inNetwork ? (
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Unlock className="h-4 w-4" />
                  <span className="text-sm font-medium">Contact Unlocked</span>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  In Network
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  onClick={handleUnlock}
                  disabled={!canUnlock || isUpdating}
                  variant={canUnlock ? "outline-primary" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {isUpdating ? "Unlocking..." : "Unlock Contact"}
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  {canUnlock ? `1 credit required (${mockCurrentVendor.credits} available)` : "No credits available"}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorResultCard;
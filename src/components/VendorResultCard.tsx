import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Lock } from "lucide-react";
import UnlockContactModal from "./UnlockContactModal";

interface VendorResultCardProps {
  rep: {
    id: number;
    initials: string;
    distance: string;
    systems: string[];
    inspectionTypes: string[];
    pricing: string;
  };
}

const VendorResultCard = ({ rep }: VendorResultCardProps) => {
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
                </div>
              </div>
            </div>

            {/* Systems */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Systems:</Label>
              <div className="flex gap-2">
                {rep.systems.map((system) => (
                  <Badge key={system} variant="secondary">
                    {system}
                  </Badge>
                ))}
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

          {/* Unlock Contact Button */}
          <div className="flex flex-col items-end gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline-primary" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock Contact
                </Button>
              </DialogTrigger>
              <UnlockContactModal repInitials={rep.initials} />
            </Dialog>
            
            <div className="text-xs text-muted-foreground text-center">
              3 credits required
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorResultCard;
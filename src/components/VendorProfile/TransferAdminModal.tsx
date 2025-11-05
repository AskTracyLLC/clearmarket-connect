import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorStaffMember {
  id: string;
  user_id: string;
  role: 'admin' | 'staff';
  users: {
    display_name: string;
    anonymous_username: string;
  } | null;
}

interface TransferAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorOrgId: string;
  currentPrimaryAdminId: string;
  adminStaffMembers: VendorStaffMember[];
  onTransferComplete: () => void;
}

export function TransferAdminModal({
  open,
  onOpenChange,
  vendorOrgId,
  currentPrimaryAdminId,
  adminStaffMembers,
  onTransferComplete,
}: TransferAdminModalProps) {
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const { toast } = useToast();

  // Filter out current primary admin from selection
  const eligibleAdmins = adminStaffMembers.filter(
    (member) => member.user_id !== currentPrimaryAdminId
  );

  const handleTransfer = async () => {
    if (!selectedAdminId) {
      toast({
        title: "No admin selected",
        description: "Please select an admin to transfer ownership to.",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      const { data, error } = await supabase.rpc("transfer_vendor_primary_admin", {
        target_vendor_org_id: vendorOrgId,
        new_admin_user_id: selectedAdminId,
      });

      if (error) throw error;

      toast({
        title: "Ownership transferred",
        description: "Primary admin ownership has been successfully transferred.",
      });

      onTransferComplete();
      onOpenChange(false);
      setSelectedAdminId("");
    } catch (error: any) {
      console.error("Error transferring admin:", error);
      toast({
        title: "Transfer failed",
        description: error.message || "Failed to transfer ownership. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Transfer Primary Admin
          </DialogTitle>
          <DialogDescription>
            Transfer primary admin ownership to another admin staff member. This action will:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Transfer full organization control</li>
                <li>Allow the new admin to manage all staff</li>
                <li>Log this action in audit trail</li>
                <li>Cannot be undone (only reversed by the new admin)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {eligibleAdmins.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No other admin staff members available for transfer. You must first promote another staff member to admin.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select new primary admin</label>
              <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an admin..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleAdmins.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.users?.display_name || member.users?.anonymous_username || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedAdminId("");
            }}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedAdminId || isTransferring || eligibleAdmins.length === 0}
          >
            {isTransferring ? "Transferring..." : "Transfer Ownership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Eye, Shield } from "lucide-react";
import { useImpersonation } from "@/hooks/useImpersonation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    display_name: string;
    anonymous_username: string;
    role: string;
  } | null;
}

const SUPPORT_ACTIONS = [
  { id: 'support.reset_mfa', label: 'Reset MFA', description: 'Reset multi-factor authentication' },
  { id: 'support.resend_verify', label: 'Resend Verification', description: 'Resend email verification' },
  { id: 'support.fix_status', label: 'Fix Status', description: 'Fix account status issues' },
  { id: 'support.add_note', label: 'Add Note', description: 'Add support notes to account' },
];

export const ImpersonateModal = ({ open, onOpenChange, user }: ImpersonateModalProps) => {
  const { startImpersonation } = useImpersonation();
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"readonly" | "support">("readonly");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || reason.length < 10) {
      return;
    }

    setLoading(true);
    const result = await startImpersonation(
      user.id,
      reason,
      mode === "readonly",
      mode === "support" ? selectedScopes : []
    );

    setLoading(false);

    if (result.success) {
      onOpenChange(false);
      // Reset form
      setReason("");
      setMode("readonly");
      setSelectedScopes([]);
    }
  };

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId)
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            View the application as {user?.display_name || user?.anonymous_username} ({user?.role})
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action will be fully audited. Only use impersonation for legitimate support purposes.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Impersonation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need to impersonate this user (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {reason.length}/10 characters minimum
            </p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <Label>Impersonation Mode</Label>
            <RadioGroup value={mode} onValueChange={(value: "readonly" | "support") => setMode(value)}>
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="readonly" id="readonly" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="readonly" className="flex items-center gap-2 cursor-pointer">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold">Read-only (Default)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    View the user's experience without making any changes. All write operations are blocked.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="support" id="support" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="support" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">Support Mode</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Perform limited support actions. Select specific scopes below.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Support Actions */}
          {mode === "support" && (
            <div className="space-y-3">
              <Label>Support Actions (Select Allowed Operations)</Label>
              <div className="space-y-2 border rounded-lg p-4">
                {SUPPORT_ACTIONS.map((action) => (
                  <div key={action.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={action.id}
                      checked={selectedScopes.includes(action.id)}
                      onCheckedChange={() => handleScopeToggle(action.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={action.id} className="font-medium cursor-pointer">
                        {action.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Security Restrictions</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Session expires after 15 minutes</li>
              <li>Password resets, payments, and API keys are blocked</li>
              <li>All actions are logged to the audit trail</li>
              <li>Read-only mode disables all write operations</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={reason.length < 10 || loading}
          >
            {loading ? "Starting..." : "Start Impersonation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

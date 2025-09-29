import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Infinity, TrendingUp, AlertCircle } from "lucide-react";

interface ConnectionLimitInfo {
  user_role: string;
  trust_badge: string | null;
  custom_limit: number | null;
  effective_limit: number | null;
  is_unlimited: boolean;
  today_count: number;
  remaining_today: number;
}

interface ConnectionLimitManagerProps {
  userId: string;
  displayName: string;
}

export const ConnectionLimitManager = ({ userId, displayName }: ConnectionLimitManagerProps) => {
  const { toast } = useToast();
  const [limitInfo, setLimitInfo] = useState<ConnectionLimitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newLimit, setNewLimit] = useState<string>("");

  useEffect(() => {
    fetchLimitInfo();
  }, [userId]);

  const fetchLimitInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_user_connection_limit_info', {
          target_user_id: userId
        });

      if (error) throw error;
      
      const limitData = data as unknown as ConnectionLimitInfo;
      setLimitInfo(limitData);
      setNewLimit(limitData.custom_limit?.toString() || "");
    } catch (error) {
      console.error('Error fetching limit info:', error);
      toast({
        title: "Error",
        description: "Failed to load connection limit info",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    setIsSaving(true);
    try {
      const limitValue = newLimit === "" ? null : parseInt(newLimit);
      
      if (limitValue !== null && (isNaN(limitValue) || limitValue < 0)) {
        toast({
          title: "Invalid Input",
          description: "Please enter a positive number or leave blank for default",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .rpc('admin_set_connection_request_limit', {
          target_user_id: userId,
          new_limit: limitValue
        });

      if (error) throw error;

      toast({
        title: "Limit Updated",
        description: `Connection request limit for ${displayName} has been updated successfully.`,
      });

      fetchLimitInfo();
    } catch (error: any) {
      console.error('Error updating limit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update connection limit",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setNewLimit("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connection Request Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!limitInfo) return null;

  const getDefaultLimit = () => {
    if (limitInfo.trust_badge === 'trusted' || limitInfo.trust_badge === 'verified_pro') {
      return 'Unlimited (Trusted Status)';
    }
    return limitInfo.user_role === 'vendor' ? '5 requests/day' : '10 requests/day';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Connection Request Limits
        </CardTitle>
        <CardDescription>
          Manage daily connection request limits for {displayName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Current Effective Limit</Label>
            <div className="flex items-center gap-2">
              {limitInfo.is_unlimited ? (
                <>
                  <Infinity className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Unlimited</span>
                  <Badge variant="secondary" className="ml-2">
                    {limitInfo.trust_badge === 'verified_pro' ? 'Verified Pro' : 'Trusted'}
                  </Badge>
                </>
              ) : (
                <>
                  <span className="font-semibold text-xl">{limitInfo.effective_limit}</span>
                  <span className="text-muted-foreground">requests/day</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground">Today's Usage</Label>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xl">{limitInfo.today_count}</span>
              <span className="text-muted-foreground">sent today</span>
              {!limitInfo.is_unlimited && limitInfo.remaining_today <= 2 && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
        </div>

        {/* Trust Score Info */}
        {limitInfo.trust_badge && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              {limitInfo.trust_badge === 'trusted' || limitInfo.trust_badge === 'verified_pro' 
                ? 'This user has earned unlimited connection requests through their trust score.'
                : `Trust Badge: ${limitInfo.trust_badge}`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Default Limit Info */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Default Limit (No Override)</p>
              <p className="text-sm text-muted-foreground">{getDefaultLimit()}</p>
            </div>
            {limitInfo.custom_limit !== null && (
              <Badge variant="outline">Override Active</Badge>
            )}
          </div>
        </div>

        {/* Custom Limit Input */}
        <div className="space-y-3 pt-2">
          <Label htmlFor="custom-limit">Set Custom Limit</Label>
          <div className="flex gap-2">
            <Input
              id="custom-limit"
              type="number"
              min="0"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Leave blank for default"
              className="flex-1"
            />
            <Button
              onClick={handleResetToDefault}
              variant="outline"
              disabled={isSaving || newLimit === ""}
            >
              Reset
            </Button>
            <Button
              onClick={handleUpdateLimit}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a number to set a custom daily limit, or leave blank to use role-based defaults.
            Users with "Trusted" or higher badges automatically get unlimited requests.
          </p>
        </div>

        {/* Limit Rules Summary */}
        <div className="pt-2 border-t space-y-2">
          <p className="text-sm font-medium">Limit Rules:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Trusted/Verified Pro users: Unlimited (automatic)</li>
            <li>Vendors (default): 5 requests per day</li>
            <li>Field Reps (default): 10 requests per day</li>
            <li>Custom limits override all defaults</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
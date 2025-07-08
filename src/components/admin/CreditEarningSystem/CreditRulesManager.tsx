import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CreditRule, CreditRuleFormData } from "./types";
import { Edit2, Save, X, AlertCircle } from "lucide-react";

export const CreditRulesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<CreditRule[]>([]);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CreditRuleFormData>({
    credit_amount: 0,
    daily_limit: null,
    cooldown_hours: null,
    max_per_target: null,
    is_enabled: true,
    internal_notes: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCreditRules();
  }, []);

  const loadCreditRules = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_earning_rules")
        .select("*")
        .order("rule_name");

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error loading credit rules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load credit rules"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (rule: CreditRule) => {
    setEditingRule(rule.id);
    setEditForm({
      credit_amount: rule.credit_amount,
      daily_limit: rule.daily_limit,
      cooldown_hours: rule.cooldown_hours,
      max_per_target: rule.max_per_target,
      is_enabled: rule.is_enabled,
      internal_notes: rule.internal_notes || ""
    });
  };

  const cancelEditing = () => {
    setEditingRule(null);
    setEditForm({
      credit_amount: 0,
      daily_limit: null,
      cooldown_hours: null,
      max_per_target: null,
      is_enabled: true,
      internal_notes: ""
    });
  };

  const saveRule = async (ruleId: string) => {
    if (!user) return;

    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;

      // Create audit log entry
      await supabase
        .from("credit_earning_audit_log")
        .insert({
          rule_id: ruleId,
          admin_id: user.id,
          action_type: "update",
          before_values: JSON.parse(JSON.stringify({
            credit_amount: rule.credit_amount,
            daily_limit: rule.daily_limit,
            cooldown_hours: rule.cooldown_hours,
            max_per_target: rule.max_per_target,
            is_enabled: rule.is_enabled,
            internal_notes: rule.internal_notes
          })),
          after_values: JSON.parse(JSON.stringify(editForm)),
          notes: `Updated rule: ${rule.rule_name}`
        });

      // Update the rule
      const { error } = await supabase
        .from("credit_earning_rules")
        .update({
          ...editForm,
          updated_at: new Date().toISOString()
        })
        .eq("id", ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Credit rule updated successfully"
      });

      setEditingRule(null);
      loadCreditRules();
    } catch (error) {
      console.error("Error updating rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update credit rule"
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, enabled: boolean) => {
    if (!user) return;

    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;

      // Create audit log entry
      await supabase
        .from("credit_earning_audit_log")
        .insert({
          rule_id: ruleId,
          admin_id: user.id,
          action_type: enabled ? "enable" : "disable",
          before_values: JSON.parse(JSON.stringify({ is_enabled: rule.is_enabled })),
          after_values: JSON.parse(JSON.stringify({ is_enabled: enabled })),
          notes: `${enabled ? "Enabled" : "Disabled"} rule: ${rule.rule_name}`
        });

      // Update the rule
      const { error } = await supabase
        .from("credit_earning_rules")
        .update({
          is_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq("id", ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rule ${enabled ? "enabled" : "disabled"} successfully`
      });

      loadCreditRules();
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update rule status"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading credit rules...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes to credit rules affect how users earn credits platform-wide. All changes are logged for audit purposes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={`${!rule.is_enabled ? "opacity-60" : ""}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                  <Badge variant={rule.is_enabled ? "default" : "secondary"}>
                    {rule.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {rule.requires_verification && (
                    <Badge variant="outline">Requires Verification</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.is_enabled}
                    onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                  />
                  {editingRule === rule.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveRule(rule.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEditing(rule)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{rule.rule_description}</p>
            </CardHeader>
            <CardContent>
              {editingRule === rule.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="credit_amount">Credit Amount</Label>
                    <Input
                      id="credit_amount"
                      type="number"
                      step="0.1"
                      value={editForm.credit_amount}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        credit_amount: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="daily_limit">Daily Limit</Label>
                    <Input
                      id="daily_limit"
                      type="number"
                      placeholder="No limit"
                      value={editForm.daily_limit || ""}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        daily_limit: e.target.value ? parseInt(e.target.value) : null
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cooldown_hours">Cooldown (hours)</Label>
                    <Input
                      id="cooldown_hours"
                      type="number"
                      placeholder="No cooldown"
                      value={editForm.cooldown_hours || ""}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        cooldown_hours: e.target.value ? parseInt(e.target.value) : null
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_per_target">Max per Target</Label>
                    <Input
                      id="max_per_target"
                      type="number"
                      placeholder="No limit"
                      value={editForm.max_per_target || ""}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        max_per_target: e.target.value ? parseInt(e.target.value) : null
                      })}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <Label htmlFor="internal_notes">Internal Notes</Label>
                    <Textarea
                      id="internal_notes"
                      placeholder="Add internal notes about this rule..."
                      value={editForm.internal_notes}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        internal_notes: e.target.value
                      })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Credit Amount</Label>
                    <p className="text-lg font-semibold">{rule.credit_amount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Daily Limit</Label>
                    <p className="text-lg">{rule.daily_limit || "Unlimited"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cooldown</Label>
                    <p className="text-lg">{rule.cooldown_hours ? `${rule.cooldown_hours}h` : "None"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max per Target</Label>
                    <p className="text-lg">{rule.max_per_target || "Unlimited"}</p>
                  </div>
                  {rule.internal_notes && (
                    <div className="md:col-span-2 lg:col-span-4">
                      <Label className="text-sm font-medium">Internal Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">{rule.internal_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
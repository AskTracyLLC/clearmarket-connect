import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditAuditEntry } from "./types";
import { Download, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CreditAuditLogWithDetails extends CreditAuditEntry {
  rule_name?: string;
  admin_name?: string;
}

export const CreditAuditLog = () => {
  const { toast } = useToast();
  const [auditEntries, setAuditEntries] = useState<CreditAuditLogWithDetails[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CreditAuditLogWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterRule, setFilterRule] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const actionTypes = ["all", "update", "enable", "disable"];
  const actionColors = {
    update: "default",
    enable: "default",
    disable: "secondary"
  } as const;

  useEffect(() => {
    loadAuditLog();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [auditEntries, filterAction, filterRule, searchTerm]);

  const loadAuditLog = async () => {
    try {
      const { data, error } = await supabase
const { data, error } = await supabase
  .from("credit_earning_audit_log")
  .select(`
    *,
    credit_earning_rules (rule_name),
    users!credit_earning_audit_log_admin_id_fkey (display_name, anonymous_username)
  `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const entriesWithDetails = data?.map(entry => ({
        ...entry,
        rule_name: entry.credit_earning_rules?.rule_name,
        admin_name: entry.users?.display_name || entry.users?.anonymous_username || "Unknown Admin",
        before_values: entry.before_values ? 
          (typeof entry.before_values === 'string' ? JSON.parse(entry.before_values) : entry.before_values) : null,
        after_values: entry.after_values ? 
          (typeof entry.after_values === 'string' ? JSON.parse(entry.after_values) : entry.after_values) : null
      })) || [];

      setAuditEntries(entriesWithDetails);
    } catch (error) {
      console.error("Error loading audit log:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load audit log"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = auditEntries;

    if (filterAction !== "all") {
      filtered = filtered.filter(entry => entry.action_type === filterAction);
    }

    if (filterRule !== "all") {
      filtered = filtered.filter(entry => entry.rule_id === filterRule);
    }

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.rule_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  };

  const exportAuditLog = async () => {
    try {
      const csvContent = [
        ["Date", "Admin", "Rule", "Action", "Before", "After", "Notes"].join(","),
        ...filteredEntries.map(entry => [
          format(new Date(entry.created_at), "yyyy-MM-dd HH:mm:ss"),
          entry.admin_name || "",
          entry.rule_name || "",
          entry.action_type,
          entry.before_values ? JSON.stringify(entry.before_values) : "",
          entry.after_values ? JSON.stringify(entry.after_values) : "",
          entry.notes || ""
        ].map(field => `"${field}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `credit-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Audit log exported successfully"
      });
    } catch (error) {
      console.error("Error exporting audit log:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export audit log"
      });
    }
  };

  const getUniqueRules = () => {
    const rules = auditEntries.reduce((acc, entry) => {
      if (entry.rule_id && entry.rule_name && !acc.some(r => r.id === entry.rule_id)) {
        acc.push({ id: entry.rule_id, name: entry.rule_name });
      }
      return acc;
    }, [] as { id: string; name: string }[]);
    return rules;
  };

  const formatValueChange = (before: any, after: any) => {
    if (!before && !after) return "N/A";
    
    if (typeof before === "object" && typeof after === "object") {
      const changes = Object.keys(after).map(key => {
        if (before[key] !== after[key]) {
          return `${key}: ${before[key]} → ${after[key]}`;
        }
        return null;
      }).filter(Boolean);
      return changes.join(", ") || "No changes";
    }
    
    return `${before} → ${after}`;
  };

  if (isLoading) {
    return <div className="text-center">Loading audit log...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by rule, admin, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.slice(1).map(action => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterRule} onValueChange={setFilterRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rules</SelectItem>
                  {getUniqueRules().map(rule => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={exportAuditLog} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No audit entries found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={actionColors[entry.action_type as keyof typeof actionColors] || "default"}>
                      {entry.action_type.charAt(0).toUpperCase() + entry.action_type.slice(1)}
                    </Badge>
                    <div>
                      <p className="font-medium">{entry.rule_name}</p>
                      <p className="text-sm text-muted-foreground">
                        by {entry.admin_name} • {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>

                {entry.before_values && entry.after_values && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Changes:</p>
                    <p className="text-sm text-muted-foreground">
                      {formatValueChange(entry.before_values, entry.after_values)}
                    </p>
                  </div>
                )}

                {entry.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

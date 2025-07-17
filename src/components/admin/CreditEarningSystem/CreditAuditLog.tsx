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
      // Get audit log entries first
      const { data: auditData, error: auditError } = await supabase
        .from("credit_earning_audit_log")
        .select(`
          *,
          credit_earning_rules (rule_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      // Get admin names separately
      const adminIds = auditData?.map(entry => entry.admin_id).filter(Boolean) || [];
      let adminsData: any[] = [];
      
      if (adminIds.length > 0) {
        const { data: adminUsers } = await supabase
          .from("users")
          .select("id, display_name, anonymous_username")
          .in("id", adminIds);
        adminsData = adminUsers || [];
      }

      const entriesWithDetails = auditData?.map(entry => ({
        ...entry,
        rule_name: entry.credit_earning_rules?.rule_name,
        admin_name: (() => {
          const admin = adminsData.find(a => a.id === entry.admin_id);
          return admin?.display_name || admin?.anonymous_username || "Unknown Admin";
        })(),
        before_values: entry.before_values ? 
          (typeof entry.before_values === 'string' ? JSON.parse(entry.before_values) : entry.before_values) : null,
        after_values: entry.after_values ? 
          (typeof entry.after_values === 'string' ? JSON.parse(entry.after_values) : entry.after_values) : null
      })) || [];

      setAuditEntries(entriesWithDetails);
    } catch (error: any) {
      toast({
        title: "Error loading audit log",
        description: error.message,
        variant: "destructive",
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
        entry.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.rule_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  };

  const exportAuditLog = () => {
    const csvContent = [
      ["Date", "Admin", "Action", "Rule", "Notes"].join(","),
      ...filteredEntries.map(entry => [
        format(new Date(entry.created_at), "yyyy-MM-dd HH:mm:ss"),
        entry.admin_name || "Unknown",
        entry.action_type,
        entry.rule_name || "Unknown Rule",
        entry.notes || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credit-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Credit System Audit Log</span>
          <Button onClick={exportAuditLog} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map(action => (
                <SelectItem key={action} value={action}>
                  {action === "all" ? "All Actions" : action.charAt(0).toUpperCase() + action.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by admin, rule, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Audit Entries */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={actionColors[entry.action_type as keyof typeof actionColors] || "default"}>
                        {entry.action_type}
                      </Badge>
                      <span className="font-medium">{entry.rule_name || "Unknown Rule"}</span>
                      <span className="text-sm text-muted-foreground">
                        by {entry.admin_name}
                      </span>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}

                    {(entry.before_values || entry.after_values) && (
                      <div className="text-xs space-y-1">
                        {entry.before_values && (
                          <div>
                            <span className="font-medium">Before: </span>
                            <code className="bg-muted px-1 rounded">
                              {JSON.stringify(entry.before_values)}
                            </code>
                          </div>
                        )}
                        {entry.after_values && (
                          <div>
                            <span className="font-medium">After: </span>
                            <code className="bg-muted px-1 rounded">
                              {JSON.stringify(entry.after_values)}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(entry.created_at), "MMM d, yyyy HH:mm")}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No audit entries found matching your filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Download, RefreshCw, Search, Filter, Calendar } from "lucide-react";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import DateRangeSelector from "@/components/calendar/components/DateRangeSelector";

interface ActivityLog {
  id: string;
  action: string;
  target_table: string;
  target_id: string;
  user_id: string;
  created_at: string;
  metadata: any;
  user_display_name?: string;
  target_user_display_name?: string;
}

interface UserActivityLogProps {
  targetUserId?: string;
  showUserFilter?: boolean;
}

export const UserActivityLog = ({ targetUserId, showUserFilter = true }: UserActivityLogProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState(targetUserId || "all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const actionTypes = [
    { value: "all", label: "All Actions" },
    { value: "profile_update", label: "Profile Updates" },
    { value: "role_change", label: "Role Changes" },
    { value: "post_removed", label: "Post Removals" },
    { value: "user_created", label: "User Created" },
    { value: "trust_score_update", label: "Trust Score Updates" },
    { value: "password_change", label: "Password Changes" },
    { value: "email_change", label: "Email Changes" },
    { value: "coverage_update", label: "Coverage Updates" },
  ];

  const dateFilterTypes = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ];

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case "today":
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case "week":
        return {
          start: startOfDay(subWeeks(now, 1)),
          end: endOfDay(now)
        };
      case "month":
        return {
          start: startOfDay(subMonths(now, 1)),
          end: endOfDay(now)
        };
      case "custom":
        return {
          start: startDate ? startOfDay(startDate) : undefined,
          end: endDate ? endOfDay(endDate) : undefined
        };
      default:
        return { start: undefined, end: undefined };
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_log')
        .select(`
          id,
          action,
          target_table,
          target_id,
          user_id,
          created_at,
          metadata
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter by specific user if provided
      if (targetUserId && targetUserId !== "all") {
        query = query.or(`user_id.eq.${targetUserId},target_id.eq.${targetUserId}`);
      }

      // Filter by action type
      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      // Filter by date range
      const { start, end } = getDateRange();
      if (start) {
        query = query.gte('created_at', start.toISOString());
      }
      if (end) {
        query = query.lte('created_at', end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user display names for the logs
      const userIds = Array.from(new Set([
        ...data.map(log => log.user_id),
        ...data.map(log => log.target_id)
      ].filter(Boolean)));

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, display_name, anonymous_username')
          .in('id', userIds);

        const userMap = users?.reduce((acc, user) => {
          acc[user.id] = user.display_name || user.anonymous_username;
          return acc;
        }, {} as Record<string, string>) || {};

        const enrichedLogs = data.map(log => ({
          ...log,
          user_display_name: userMap[log.user_id] || 'Unknown User',
          target_user_display_name: userMap[log.target_id] || 'Unknown User'
        }));

        setLogs(enrichedLogs);
      } else {
        setLogs(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [targetUserId, actionFilter, userFilter, dateFilter, startDate, endDate]);

  const exportLogs = () => {
    const filteredLogs = logs.filter(log => 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_user_display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const csvContent = [
      ["Date", "Action", "Actor", "Target", "Details", "Metadata"].join(","),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        log.user_display_name || 'System',
        log.target_user_display_name || log.target_table,
        getActionDescription(log),
        JSON.stringify(log.metadata || {})
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_activity_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Activity logs exported successfully",
    });
  };

  const getActionDescription = (log: ActivityLog) => {
    switch (log.action) {
      case 'role_change':
        return `Role changed from ${log.metadata?.old_role} to ${log.metadata?.new_role}`;
      case 'profile_update':
        return 'Profile information updated';
      case 'post_removed':
        return `Post removed - Reason: ${log.metadata?.reason || 'Not specified'}`;
      case 'email_change':
        return 'Email address updated';
      case 'password_change':
        return 'Password changed';
      case 'trust_score_update':
        return `Trust score updated to ${log.metadata?.new_score}`;
      case 'coverage_update':
        return 'Coverage area or services updated';
      case 'user_created':
        return 'User account created';
      default:
        return log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      role_change: 'destructive',
      post_removed: 'destructive',
      profile_update: 'secondary',
      email_change: 'secondary',
      password_change: 'secondary',
      trust_score_update: 'default',
      coverage_update: 'secondary',
      user_created: 'default'
    };

    return (
      <Badge variant={colorMap[action] as any || 'outline'}>
        {action.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_user_display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          User Activity Log
          {targetUserId && (
            <Badge variant="outline" className="ml-2">
              User Specific
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchActivityLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFilterTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateFilter === "custom" && (
              <div className="flex gap-2 items-center">
                <DateRangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
            )}
          </div>
        </div>

        {/* Activity Log Table */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user_display_name || 'System'}
                    </TableCell>
                    <TableCell>
                      {log.target_user_display_name || log.target_table || '-'}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={getActionDescription(log)}>
                        {getActionDescription(log)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, AlertTriangle, TrendingUp, Plus } from "lucide-react";
import { ScheduleDiscussionModal } from "./ScheduleDiscussionModal";

interface ScheduledPost {
  id: string;
  scheduled_date: string;
  status: string;
  conflict_reason?: string;
  discussion_template_id: string;
  discussion_templates: {
    title: string;
    category: string;
    priority: number;
  };
}

interface SchedulerStats {
  scheduled: number;
  posted: number;
  conflicts: number;
  thisWeek: number;
}

export const SchedulerDashboard = () => {
  const [stats, setStats] = useState<SchedulerStats>({ scheduled: 0, posted: 0, conflicts: 0, thisWeek: 0 });
  const [upcomingPosts, setUpcomingPosts] = useState<ScheduledPost[]>([]);
  const [conflicts, setConflicts] = useState<ScheduledPost[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch scheduled posts with template info
      const { data: scheduledPosts, error: postsError } = await supabase
        .from('scheduled_discussion_posts')
        .select(`
          *,
          discussion_templates (
            title,
            category,
            priority
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (postsError) throw postsError;

      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Calculate stats
      const scheduledCount = scheduledPosts?.filter(p => p.status === 'scheduled').length || 0;
      const postedCount = scheduledPosts?.filter(p => p.status === 'posted').length || 0;
      const conflictsCount = scheduledPosts?.filter(p => p.status === 'conflict_detected').length || 0;
      const thisWeekCount = scheduledPosts?.filter(p => 
        new Date(p.scheduled_date) >= now && new Date(p.scheduled_date) <= nextWeek
      ).length || 0;

      setStats({
        scheduled: scheduledCount,
        posted: postedCount,
        conflicts: conflictsCount,
        thisWeek: thisWeekCount
      });

      // Set upcoming posts (next 7 days)
      const upcoming = scheduledPosts?.filter(p => 
        p.status === 'scheduled' && 
        new Date(p.scheduled_date) >= now && 
        new Date(p.scheduled_date) <= nextWeek
      ).slice(0, 5) || [];

      setUpcomingPosts(upcoming);

      // Set conflicts that need attention
      const conflictPosts = scheduledPosts?.filter(p => p.status === 'conflict_detected') || [];
      setConflicts(conflictPosts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduler dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default">Scheduled</Badge>;
      case 'posted':
        return <Badge variant="secondary">Posted</Badge>;
      case 'conflict_detected':
        return <Badge variant="destructive">Conflict</Badge>;
      case 'skipped':
        return <Badge variant="outline">Skipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-12 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Scheduler</h2>
          <p className="text-muted-foreground">Automate community discussions to keep engagement consistent</p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Discussion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Ready to post</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posted}</div>
            <p className="text-xs text-muted-foreground">Successfully posted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conflicts}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No posts scheduled for the next 7 days</p>
            ) : (
              <div className="space-y-3">
                {upcomingPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{post.discussion_templates.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(post.scheduled_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {post.discussion_templates.category}
                      </Badge>
                      {getStatusBadge(post.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conflicts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conflicts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No conflicts detected</p>
            ) : (
              <div className="space-y-3">
                {conflicts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg border-destructive/20">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{post.discussion_templates.title}</p>
                      <p className="text-xs text-muted-foreground">{post.conflict_reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Conflict
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScheduleDiscussionModal 
        open={showScheduleModal} 
        onOpenChange={setShowScheduleModal}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
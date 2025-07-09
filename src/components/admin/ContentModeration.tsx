import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Flag, MessageSquare, User, Eye, Check, X, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FlaggedContent {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  flagged_by: string;
  created_at: string;
  status: string;
  content?: any;
  flagged_by_user?: any;
}

interface ModerationAction {
  id: string;
  moderator_id: string;
  target_type: string;
  target_id: string;
  action_type: string;
  reason: string;
  notes: string;
  created_at: string;
  moderator?: any;
}

export const ContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  const fetchFlaggedContent = async () => {
    try {
      const { data: flags, error: flagsError } = await supabase
        .from('flags')
        .select(`
          *,
          flagged_by_user:users!flags_flagged_by_fkey(display_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (flagsError) throw flagsError;

      // Fetch associated content for each flag
      const enrichedFlags = await Promise.all((flags || []).map(async (flag) => {
        let content = null;
        
        try {
          switch (flag.target_type) {
            case 'post':
              const { data: post } = await supabase
                .from('community_posts')
                .select('*, user:users(display_name)')
                .eq('id', flag.target_id)
                .single();
              content = post;
              break;
            case 'comment':
              const { data: comment } = await supabase
                .from('community_comments')
                .select('*, user:users(display_name)')
                .eq('id', flag.target_id)
                .single();
              content = comment;
              break;
            case 'profile':
              const { data: userProfile } = await supabase
                .from('users')
                .select('display_name')
                .eq('id', flag.target_id)
                .single();
              content = userProfile;
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${flag.target_type}:`, error);
        }

        return { ...flag, content };
      }));

      setFlaggedContent(enrichedFlags);
    } catch (error: any) {
      console.error('Error fetching flagged content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flagged content",
        variant: "destructive"
      });
    }
  };

  const fetchModerationActions = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:users(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setModerationActions(data || []);
    } catch (error: any) {
      console.error('Error fetching moderation actions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch moderation actions",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFlaggedContent(), fetchModerationActions()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleModerationAction = async (flag: FlaggedContent, actionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Record moderation action
      const { error: actionError } = await supabase
        .from('moderation_actions')
        .insert({
          moderator_id: user.id,
          target_type: flag.target_type,
          target_id: flag.target_id,
          action_type: actionType,
          reason: flag.reason,
          notes: actionNotes,
          metadata: { flag_id: flag.id }
        });

      if (actionError) throw actionError;

      // Update flag status
      const { error: flagError } = await supabase
        .from('flags')
        .update({ status: actionType === 'approve' ? 'dismissed' : 'reviewed' })
        .eq('id', flag.id);

      if (flagError) throw flagError;

      // Apply action to content
      if (actionType === 'hide' || actionType === 'delete') {
        switch (flag.target_type) {
          case 'post':
            await supabase
              .from('community_posts')
              .update({ flagged: true })
              .eq('id', flag.target_id);
            break;
          case 'comment':
            await supabase
              .from('community_comments')
              .update({ flagged: true })
              .eq('id', flag.target_id);
            break;
        }
      }

      toast({
        title: "Success",
        description: `Content ${actionType} successfully`,
      });

      // Refresh data
      fetchFlaggedContent();
      fetchModerationActions();
      setSelectedContent(null);
      setActionNotes("");

    } catch (error: any) {
      console.error('Error taking moderation action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to take moderation action",
        variant: "destructive"
      });
    }
  };

  const getContentPreview = (content: any, type: string) => {
    if (!content) return "Content not found";
    
    switch (type) {
      case 'post':
        return content.content?.substring(0, 100) + "...";
      case 'comment':
        return content.content?.substring(0, 100) + "...";
      case 'profile':
        return content?.display_name || "User profile";
      default:
        return "Unknown content type";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      dismissed: "outline",
      resolved: "default"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getActionBadge = (actionType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approve: "default",
      hide: "secondary",
      warn: "outline",
      delete: "destructive"
    };
    return <Badge variant={variants[actionType]}>{actionType}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Content Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Content Moderation Center
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => {
          fetchFlaggedContent();
          fetchModerationActions();
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flagged" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Flagged Content ({flaggedContent.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Recent Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged" className="mt-6">
            {flaggedContent.length === 0 ? (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  No flagged content pending review. Great job keeping the community clean!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content Type</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Flagged By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedContent.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <Badge variant="outline">{flag.target_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {getContentPreview(flag.content, flag.target_type)}
                        </TableCell>
                        <TableCell>{flag.flagged_by_user?.display_name || "Unknown"}</TableCell>
                        <TableCell>{flag.reason}</TableCell>
                        <TableCell>{new Date(flag.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedContent(flag)}>
                                <Eye className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Flagged Content</DialogTitle>
                              </DialogHeader>
                              {selectedContent && (
                                <div className="space-y-4">
                                  <div className="flex gap-4">
                                    <Badge variant="outline">{selectedContent.target_type}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Flagged by {selectedContent.flagged_by_user?.display_name} 
                                      on {new Date(selectedContent.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Reason for flag:</h4>
                                    <p className="text-sm bg-muted p-2 rounded">{selectedContent.reason}</p>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="font-medium">Content:</h4>
                                    <div className="bg-muted p-3 rounded max-h-40 overflow-y-auto">
                                      <pre className="text-sm whitespace-pre-wrap">
                                        {selectedContent.content ? 
                                          JSON.stringify(selectedContent.content, null, 2) : 
                                          "Content not available"
                                        }
                                      </pre>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="font-medium">Moderation Notes:</h4>
                                    <Textarea
                                      placeholder="Add notes about your decision..."
                                      value={actionNotes}
                                      onChange={(e) => setActionNotes(e.target.value)}
                                    />
                                  </div>

                                  <div className="flex gap-2 pt-4">
                                    <Button 
                                      variant="default" 
                                      onClick={() => handleModerationAction(selectedContent, 'approve')}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve (Dismiss Flag)
                                    </Button>
                                    <Button 
                                      variant="secondary" 
                                      onClick={() => handleModerationAction(selectedContent, 'hide')}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Hide Content
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleModerationAction(selectedContent, 'delete')}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Delete Content
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            {moderationActions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No moderation actions recorded yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Moderator</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderationActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>{action.moderator?.display_name || "Unknown"}</TableCell>
                        <TableCell>{getActionBadge(action.action_type)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{action.target_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{action.reason}</TableCell>
                        <TableCell>{new Date(action.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
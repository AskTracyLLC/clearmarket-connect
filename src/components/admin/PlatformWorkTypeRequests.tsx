import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Request {
  id: string;
  user_id: string;
  request_type: "platform" | "work_type";
  requested_name: string;
  user_role: string;
  status: "pending" | "approved" | "rejected" | "added";
  admin_notes: string | null;
  created_at: string;
}

export const PlatformWorkTypeRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending">("pending");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from("platform_worktype_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("status", "pending");
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests((data || []) as Request[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    id: string,
    status: "approved" | "rejected",
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("platform_worktype_requests")
        .update({
          status,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${status}`
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const addAsNewOption = async (request: Request) => {
    try {
      const table = request.request_type === "platform" ? "platforms" : "work_types";
      
      // Get max display_order
      const { data: existing } = await supabase
        .from(table)
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      const maxOrder = existing?.[0]?.display_order || 0;

      // Insert new option
      const { error: insertError } = await supabase
        .from(table)
        .insert({
          name: request.requested_name,
          display_order: maxOrder + 1,
          is_active: true
        });

      if (insertError) throw insertError;

      // Update request status
      await updateRequestStatus(request.id, "approved", "Added as new option");

      toast({
        title: "Success",
        description: `Added "${request.requested_name}" as new ${request.request_type === "platform" ? "platform" : "inspection type"}`
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new option",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      added: "outline"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const platformRequests = requests.filter(r => r.request_type === "platform");
  const workTypeRequests = requests.filter(r => r.request_type === "work_type");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform & Inspection Type Requests</CardTitle>
        <CardDescription>
          Review user requests for new platforms and inspection types
        </CardDescription>
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pending Only
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Requests
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="platforms">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platforms">
              Platform Requests ({platformRequests.length})
            </TabsTrigger>
            <TabsTrigger value="worktypes">
              Inspection Type Requests ({workTypeRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No platform requests
                    </TableCell>
                  </TableRow>
                ) : (
                  platformRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.requested_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.user_role}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addAsNewOption(request)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus(request.id, "approved")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus(request.id, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="worktypes" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workTypeRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No inspection type requests
                    </TableCell>
                  </TableRow>
                ) : (
                  workTypeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.requested_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.user_role}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addAsNewOption(request)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus(request.id, "approved")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus(request.id, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
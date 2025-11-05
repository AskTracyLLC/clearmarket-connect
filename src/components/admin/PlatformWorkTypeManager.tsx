import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Platform {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface WorkType {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export const PlatformWorkTypeManager = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newWorkTypeName, setNewWorkTypeName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [platformsRes, workTypesRes] = await Promise.all([
        supabase.from("platforms").select("*").order("display_order"),
        supabase.from("work_types").select("*").order("display_order")
      ]);

      if (platformsRes.data) setPlatforms(platformsRes.data);
      if (workTypesRes.data) setWorkTypes(workTypesRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPlatform = async () => {
    if (!newPlatformName.trim()) return;

    try {
      const maxOrder = Math.max(...platforms.map(p => p.display_order), 0);
      const { error } = await supabase.from("platforms").insert({
        name: newPlatformName.trim(),
        display_order: maxOrder + 1,
        is_active: true
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform added successfully"
      });
      setNewPlatformName("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add platform",
        variant: "destructive"
      });
    }
  };

  const addWorkType = async () => {
    if (!newWorkTypeName.trim()) return;

    try {
      const maxOrder = Math.max(...workTypes.map(w => w.display_order), 0);
      const { error } = await supabase.from("work_types").insert({
        name: newWorkTypeName.trim(),
        display_order: maxOrder + 1,
        is_active: true
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inspection type added successfully"
      });
      setNewWorkTypeName("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inspection type",
        variant: "destructive"
      });
    }
  };

  const togglePlatformActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("platforms")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Platform ${!isActive ? 'activated' : 'deactivated'}`
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update platform",
        variant: "destructive"
      });
    }
  };

  const toggleWorkTypeActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("work_types")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Inspection type ${!isActive ? 'activated' : 'deactivated'}`
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inspection type",
        variant: "destructive"
      });
    }
  };

  const deletePlatform = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;

    try {
      const { error } = await supabase.from("platforms").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform deleted successfully"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete platform",
        variant: "destructive"
      });
    }
  };

  const deleteWorkType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inspection type?")) return;

    try {
      const { error } = await supabase.from("work_types").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inspection type deleted successfully"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inspection type",
        variant: "destructive"
      });
    }
  };

  const updatePlatformName = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("platforms")
        .update({ name: newName })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform name updated"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update platform name",
        variant: "destructive"
      });
    }
  };

  const updateWorkTypeName = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("work_types")
        .update({ name: newName })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inspection type name updated"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inspection type name",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform & Inspection Type Management</CardTitle>
        <CardDescription>
          Manage platform and inspection type options available to vendors and field reps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="platforms">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="worktypes">Inspection Types</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New platform name..."
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlatform()}
              />
              <Button onClick={addPlatform}>
                <Plus className="h-4 w-4 mr-2" />
                Add Platform
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Platform Name</TableHead>
                  <TableHead className="w-24">Active</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.map((platform) => (
                  <TableRow key={platform.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={platform.name}
                        onChange={(e) => {
                          const updated = platforms.map(p =>
                            p.id === platform.id ? { ...p, name: e.target.value } : p
                          );
                          setPlatforms(updated);
                        }}
                        onBlur={(e) => updatePlatformName(platform.id, e.target.value)}
                        className="max-w-md"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={platform.is_active}
                        onCheckedChange={() => togglePlatformActive(platform.id, platform.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlatform(platform.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="worktypes" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New inspection type name..."
                value={newWorkTypeName}
                onChange={(e) => setNewWorkTypeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWorkType()}
              />
              <Button onClick={addWorkType}>
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Inspection Type Name</TableHead>
                  <TableHead className="w-24">Active</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workTypes.map((workType) => (
                  <TableRow key={workType.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={workType.name}
                        onChange={(e) => {
                          const updated = workTypes.map(w =>
                            w.id === workType.id ? { ...w, name: e.target.value } : w
                          );
                          setWorkTypes(updated);
                        }}
                        onBlur={(e) => updateWorkTypeName(workType.id, e.target.value)}
                        className="max-w-md"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={workType.is_active}
                        onCheckedChange={() => toggleWorkTypeActive(workType.id, workType.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkType(workType.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
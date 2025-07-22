import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, Settings, Link } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  display_order: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface WorkType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface PlatformWorkTypeMapping {
  id: string;
  platform_id: string;
  work_type_id: string;
  is_active: boolean;
  platform: Platform;
  work_type: WorkType;
}

const WorkTypePlatformManagement = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [mappings, setMappings] = useState<PlatformWorkTypeMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch platforms
      const { data: platformsData, error: platformsError } = await supabase
        .from("platforms")
        .select("*")
        .order("display_order", { ascending: true });

      if (platformsError) throw platformsError;

      // Fetch work types
      const { data: workTypesData, error: workTypesError } = await supabase
        .from("work_types")
        .select("*")
        .order("display_order", { ascending: true });

      if (workTypesError) throw workTypesError;

      // Fetch mappings with related data
      const { data: mappingsData, error: mappingsError } = await supabase
        .from("platform_work_type_mappings")
        .select(`
          *,
          platforms!inner(*),
          work_types!inner(*)
        `)
        .eq("is_active", true);

      if (mappingsError) throw mappingsError;

      // Transform the data to match our interface
      const transformedMappings: PlatformWorkTypeMapping[] = (mappingsData || []).map(item => ({
        id: item.id,
        platform_id: item.platform_id,
        work_type_id: item.work_type_id,
        is_active: item.is_active,
        platform: item.platforms,
        work_type: item.work_types
      }));

      setPlatforms(platformsData || []);
      setWorkTypes(workTypesData || []);
      setMappings(transformedMappings);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMapping = async () => {
    if (!selectedPlatform || selectedWorkTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select a platform and at least one work type",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create mappings for selected work types
      const mappingsToCreate = selectedWorkTypes.map(workTypeId => ({
        platform_id: selectedPlatform,
        work_type_id: workTypeId,
        is_active: true
      }));

      const { error } = await supabase
        .from("platform_work_type_mappings")
        .insert(mappingsToCreate);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform-work type mappings created successfully",
      });

      setShowMappingDialog(false);
      setSelectedPlatform("");
      setSelectedWorkTypes([]);
      fetchData();

    } catch (error) {
      console.error("Error creating mappings:", error);
      toast({
        title: "Error",
        description: "Failed to create mappings",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm("Are you sure you want to delete this mapping?")) return;

    try {
      const { error } = await supabase
        .from("platform_work_type_mappings")
        .delete()
        .eq("id", mappingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mapping deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting mapping:", error);
      toast({
        title: "Error",
        description: "Failed to delete mapping",
        variant: "destructive",
      });
    }
  };

  const toggleMappingStatus = async (mapping: PlatformWorkTypeMapping) => {
    try {
      const { error } = await supabase
        .from("platform_work_type_mappings")
        .update({ is_active: !mapping.is_active })
        .eq("id", mapping.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Mapping ${mapping.is_active ? "deactivated" : "activated"} successfully`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating mapping status:", error);
      toast({
        title: "Error",
        description: "Failed to update mapping status",
        variant: "destructive",
      });
    }
  };

  const getPlatformWorkTypes = (platformId: string): WorkType[] => {
    return mappings
      .filter(mapping => mapping.platform_id === platformId && mapping.is_active)
      .map(mapping => mapping.work_type);
  };

  const getWorkTypePlatforms = (workTypeId: string): Platform[] => {
    return mappings
      .filter(mapping => mapping.work_type_id === workTypeId && mapping.is_active)
      .map(mapping => mapping.platform);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Work Type ↔ Platform Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Work Type ↔ Platform Mappings
        </CardTitle>
        <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Mappings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Platform-Work Type Mappings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.filter(p => p.is_active).map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Work Types</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded p-3">
                  {workTypes.filter(wt => wt.is_active).map((workType) => (
                    <div key={workType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={workType.id}
                        checked={selectedWorkTypes.includes(workType.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWorkTypes([...selectedWorkTypes, workType.id]);
                          } else {
                            setSelectedWorkTypes(selectedWorkTypes.filter(id => id !== workType.id));
                          }
                        }}
                      />
                      <Label htmlFor={workType.id} className="text-sm">
                        {workType.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateMapping} className="flex-1">
                  Create Mappings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMappingDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="by-platform" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="by-platform">By Platform</TabsTrigger>
            <TabsTrigger value="by-worktype">By Work Type</TabsTrigger>
            <TabsTrigger value="all-mappings">All Mappings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="by-platform" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Shows which work types each platform supports. For example, if someone selects "Occupancy Verification" work type, they will only see EZinspections and InspectorADE as platform options (not WorldAPP).
            </div>
            {platforms.filter(p => p.is_active).map((platform) => {
              const supportedWorkTypes = getPlatformWorkTypes(platform.id);
              return (
                <Card key={platform.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{platform.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {supportedWorkTypes.length} work types
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {supportedWorkTypes.length > 0 ? (
                      supportedWorkTypes.map((workType) => (
                        <span
                          key={workType.id}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                        >
                          {workType.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No work types mapped</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="by-worktype" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Shows which platforms support each work type. This determines what platform options users see based on their selected work types.
            </div>
            {workTypes.filter(wt => wt.is_active).map((workType) => {
              const supportingPlatforms = getWorkTypePlatforms(workType.id);
              return (
                <Card key={workType.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{workType.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {supportingPlatforms.length} platforms
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {supportingPlatforms.length > 0 ? (
                      supportingPlatforms.map((platform) => (
                        <span
                          key={platform.id}
                          className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs"
                        >
                          {platform.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No platforms mapped</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="all-mappings">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No mappings found. Create your first mapping to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    mappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium">{mapping.platform.name}</TableCell>
                        <TableCell>{mapping.work_type.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={mapping.is_active}
                              onCheckedChange={() => toggleMappingStatus(mapping)}
                            />
                            <span className={mapping.is_active ? "text-green-600" : "text-gray-500"}>
                              {mapping.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMapping(mapping.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkTypePlatformManagement;
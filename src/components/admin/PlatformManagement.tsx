import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, Settings } from "lucide-react";

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
}

const PlatformManagement = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showNewWorkTypeDialog, setShowNewWorkTypeDialog] = useState(false);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [newWorkTypeName, setNewWorkTypeName] = useState("");
  const [newWorkTypeDescription, setNewWorkTypeDescription] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "inspection",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch platforms and work types in parallel
      const [platformsResult, workTypesResult] = await Promise.all([
        supabase.from("platforms").select("*").order("display_order", { ascending: true }),
        supabase.from("work_types").select("*").eq("is_active", true).order("display_order", { ascending: true })
      ]);

      if (platformsResult.error) throw platformsResult.error;
      if (workTypesResult.error) throw workTypesResult.error;

      setPlatforms(platformsResult.data || []);
      setWorkTypes(workTypesResult.data || []);
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

  const fetchExistingWorkTypes = async (platformId: string) => {
    try {
      const { data, error } = await supabase
        .from("platform_work_type_mappings")
        .select("work_type_id")
        .eq("platform_id", platformId)
        .eq("is_active", true);

      if (error) throw error;
      
      setSelectedWorkTypes(data.map(item => item.work_type_id));
    } catch (error) {
      console.error("Error fetching existing work types:", error);
    }
  };

  const handleCreateNewWorkType = async () => {
    if (!newWorkTypeName.trim()) {
      toast({
        title: "Error",
        description: "Work type name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("work_types")
        .insert({
          name: newWorkTypeName.trim(),
          description: newWorkTypeDescription.trim(),
          is_active: true,
          display_order: workTypes.length + 1
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setWorkTypes([...workTypes, data]);
      
      // Auto-select the new work type
      setSelectedWorkTypes([...selectedWorkTypes, data.id]);

      // Reset form
      setNewWorkTypeName("");
      setNewWorkTypeDescription("");
      setShowNewWorkTypeDialog(false);

      toast({
        title: "Success",
        description: "New work type created successfully",
      });
    } catch (error) {
      console.error("Error creating work type:", error);
      toast({
        title: "Error",
        description: "Failed to create work type",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let platformId: string;

      if (editingPlatform) {
        // Update existing platform
        const { error } = await supabase
          .from("platforms")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            is_active: formData.is_active,
            display_order: formData.display_order,
          })
          .eq("id", editingPlatform.id);

        if (error) throw error;
        platformId = editingPlatform.id;

        // Delete existing mappings for this platform
        await supabase
          .from("platform_work_type_mappings")
          .delete()
          .eq("platform_id", platformId);

        toast({
          title: "Success",
          description: "Platform updated successfully",
        });
      } else {
        // Create new platform
        const { data, error } = await supabase
          .from("platforms")
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            is_active: formData.is_active,
            display_order: formData.display_order,
          })
          .select()
          .single();

        if (error) throw error;
        platformId = data.id;

        toast({
          title: "Success",
          description: "Platform created successfully",
        });
      }

      // Create work type mappings
      if (selectedWorkTypes.length > 0) {
        const mappings = selectedWorkTypes.map(workTypeId => ({
          platform_id: platformId,
          work_type_id: workTypeId,
          is_active: true
        }));

        const { error: mappingError } = await supabase
          .from("platform_work_type_mappings")
          .insert(mappings);

        if (mappingError) throw mappingError;
      }

      resetForm();
      setShowDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error saving platform:", error);
      toast({
        title: "Error",
        description: "Failed to save platform",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormData({
      name: platform.name,
      description: platform.description || "",
      category: platform.category,
      is_active: platform.is_active,
      display_order: platform.display_order,
    });
    fetchExistingWorkTypes(platform.id);
    setShowDialog(true);
  };

  const handleDelete = async (platformId: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;

    try {
      const { error } = await supabase
        .from("platforms")
        .delete()
        .eq("id", platformId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting platform:", error);
      toast({
        title: "Error",
        description: "Failed to delete platform",
        variant: "destructive",
      });
    }
  };

  const toggleActiveStatus = async (platform: Platform) => {
    try {
      const { error } = await supabase
        .from("platforms")
        .update({ is_active: !platform.is_active })
        .eq("id", platform.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Platform ${platform.is_active ? "deactivated" : "activated"} successfully`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating platform status:", error);
      toast({
        title: "Error",
        description: "Failed to update platform status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "inspection",
      is_active: true,
      display_order: 0
    });
    setSelectedWorkTypes([]);
    setEditingPlatform(null);
  };

  const handleNewPlatform = () => {
    resetForm();
    setShowDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading platforms...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Platform Management
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleNewPlatform} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlatform ? "Edit Platform" : "Add New Platform"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Platform Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter platform name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter platform description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="reporting">Reporting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Status</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              {/* Work Types Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Supported Work Types</Label>
                  <Dialog open={showNewWorkTypeDialog} onOpenChange={setShowNewWorkTypeDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Work Type
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Add New Work Type</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-work-type-name">Work Type Name *</Label>
                          <Input
                            id="new-work-type-name"
                            value={newWorkTypeName}
                            onChange={(e) => setNewWorkTypeName(e.target.value)}
                            placeholder="e.g., Pool Inspections"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-work-type-description">Description</Label>
                          <Textarea
                            id="new-work-type-description"
                            value={newWorkTypeDescription}
                            onChange={(e) => setNewWorkTypeDescription(e.target.value)}
                            placeholder="Brief description of this work type"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleCreateNewWorkType} className="flex-1">
                            Create
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNewWorkTypeDialog(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {workTypes.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No work types available. Create one above.
                    </div>
                  ) : (
                    workTypes.map((workType) => (
                      <div key={workType.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`work-type-${workType.id}`}
                          checked={selectedWorkTypes.includes(workType.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedWorkTypes([...selectedWorkTypes, workType.id]);
                            } else {
                              setSelectedWorkTypes(selectedWorkTypes.filter(id => id !== workType.id));
                            }
                          }}
                        />
                        <Label htmlFor={`work-type-${workType.id}`} className="text-sm flex-1">
                          {workType.name}
                          {workType.description && (
                            <span className="text-xs text-muted-foreground block">
                              {workType.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which work types this platform supports. Users will only see this platform when they select these work types.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPlatform ? "Update" : "Create"} Platform
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No platforms found. Add your first platform to get started.
                  </TableCell>
                </TableRow>
              ) : (
                platforms.map((platform) => (
                  <TableRow key={platform.id}>
                    <TableCell className="font-medium">{platform.name}</TableCell>
                    <TableCell className="capitalize">{platform.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {platform.description || "No description"}
                    </TableCell>
                    <TableCell>{platform.display_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={platform.is_active}
                          onCheckedChange={() => toggleActiveStatus(platform)}
                        />
                        <span className={platform.is_active ? "text-green-600" : "text-gray-500"}>
                          {platform.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(platform)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(platform.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformManagement;
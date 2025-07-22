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

const PlatformManagement = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "inspection",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch platforms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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

        toast({
          title: "Success",
          description: "Platform updated successfully",
        });
      } else {
        // Create new platform
        const { error } = await supabase
          .from("platforms")
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            is_active: formData.is_active,
            display_order: formData.display_order,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Platform created successfully",
        });
      }

      resetForm();
      setShowDialog(false);
      fetchPlatforms();
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

      fetchPlatforms();
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

      fetchPlatforms();
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
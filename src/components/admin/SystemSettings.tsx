import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, RefreshCw, AlertTriangle, Eye, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string;
  category: string;
  is_public: boolean;
}

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (settingKey: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      for (const [settingKey, value] of Object.entries(pendingChanges)) {
        const setting = settings.find(s => s.setting_key === settingKey);
        if (!setting) continue;

        let processedValue = value;
        
        // Process value based on type
        switch (setting.setting_type) {
          case 'boolean':
            processedValue = value;
            break;
          case 'number':
            processedValue = Number(value);
            break;
          case 'string':
            processedValue = JSON.stringify(value);
            break;
          default:
            processedValue = value;
        }

        const { error } = await supabase
          .from('system_settings')
          .update({ 
            setting_value: processedValue,
            updated_by: (await supabase.auth.getUser()).data.user?.id
          })
          .eq('setting_key', settingKey);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "System settings updated successfully",
      });

      setPendingChanges({});
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = pendingChanges[setting.setting_key] !== undefined 
      ? pendingChanges[setting.setting_key] 
      : setting.setting_type === 'string' 
        ? JSON.parse(setting.setting_value || '""')
        : setting.setting_value;

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) => handleSettingChange(setting.setting_key, checked)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.setting_key, Number(e.target.value))}
            className="w-24"
          />
        );
      case 'string':
        if (setting.setting_key.includes('message') || setting.setting_key.includes('announcement')) {
          return (
            <Textarea
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
              className="min-h-20"
              placeholder={setting.description}
            />
          );
        }
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            placeholder={setting.description}
          />
        );
      default:
        return (
          <Input
            value={String(currentValue)}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
          />
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'features': return '🔧';
      case 'maintenance': return '🚧';
      case 'ui': return '🎨';
      default: return '⚙️';
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
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
          <Settings className="h-5 w-5" />
          System Settings & Global Controls
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {hasChanges && (
            <Button variant="default" size="sm" onClick={saveSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : `Save Changes (${Object.keys(pendingChanges).length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            These settings affect the entire platform. Changes take effect immediately for all users.
          </AlertDescription>
        </Alert>

        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(category)}</span>
              <h3 className="text-lg font-semibold capitalize">{category} Settings</h3>
            </div>
            
            <div className="grid gap-4">
              {categorySettings.map((setting) => {
                const hasChange = pendingChanges[setting.setting_key] !== undefined;
                
                return (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        {setting.is_public && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                        {hasChange && (
                          <Badge variant="secondary" className="text-xs">
                            Changed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {category !== Object.keys(groupedSettings)[Object.keys(groupedSettings).length - 1] && (
              <Separator className="my-6" />
            )}
          </div>
        ))}

        {settings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No system settings found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
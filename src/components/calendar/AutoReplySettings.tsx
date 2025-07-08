import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Calendar as CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AutoReplySettings {
  id?: string;
  enabled: boolean;
  message_template: string;
  active_from?: Date;
  active_until?: Date;
}

const AutoReplySettings = () => {
  const [settings, setSettings] = useState<AutoReplySettings>({
    enabled: false,
    message_template: "Hi! I'm currently away and will return on [return_date]. Please reach out again then."
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("auto_reply_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          enabled: data.enabled,
          message_template: data.message_template || settings.message_template,
          active_from: data.active_from ? new Date(data.active_from) : undefined,
          active_until: data.active_until ? new Date(data.active_until) : undefined,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const generatePreviewMessage = () => {
    const returnDate = settings.active_until 
      ? format(settings.active_until, "MM/dd")
      : "MM/DD";
    
    return settings.message_template.replace("[return_date]", returnDate);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const settingsData = {
        user_id: user.id,
        enabled: settings.enabled,
        message_template: settings.message_template,
        active_from: settings.active_from?.toISOString().split("T")[0] || null,
        active_until: settings.active_until?.toISOString().split("T")[0] || null,
      };

      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from("auto_reply_settings")
          .update(settingsData)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from("auto_reply_settings")
          .insert(settingsData)
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Settings saved!",
        description: "Your auto-reply settings have been updated.",
      });

    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isActive = () => {
    if (!settings.enabled || !settings.active_from || !settings.active_until) {
      return false;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const from = new Date(settings.active_from);
    const until = new Date(settings.active_until);
    
    return today >= from && today <= until;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Auto-Reply Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enable Auto-Reply</Label>
            <p className="text-sm text-muted-foreground">
              Automatically respond to messages during your unavailable period
            </p>
          </div>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        {/* Status */}
        {settings.enabled && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">
              Status: {isActive() ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-muted-foreground">Inactive</span>
              )}
            </p>
            {isActive() && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-replies are currently being sent
              </p>
            )}
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {settings.active_from ? format(settings.active_from, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={settings.active_from}
                  onSelect={(date) => setSettings(prev => ({ ...prev, active_from: date }))}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {settings.active_until ? format(settings.active_until, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={settings.active_until}
                  onSelect={(date) => setSettings(prev => ({ ...prev, active_until: date }))}
                  disabled={(date) => settings.active_from ? date < settings.active_from : false}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Message Template */}
        <div>
          <Label htmlFor="message">Auto-Reply Message</Label>
          <Textarea
            id="message"
            value={settings.message_template}
            onChange={(e) => setSettings(prev => ({ ...prev, message_template: e.target.value }))}
            placeholder="Enter your auto-reply message..."
            rows={4}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use [return_date] to automatically insert your return date
          </p>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <Label className="text-sm font-medium">Preview:</Label>
          <p className="text-sm mt-2">{generatePreviewMessage()}</p>
        </div>

        {/* Save Button */}
        <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AutoReplySettings;
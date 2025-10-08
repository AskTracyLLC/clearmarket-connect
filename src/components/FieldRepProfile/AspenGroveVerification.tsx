import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FieldRepFormData } from "./types";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AspenGroveVerificationProps {
  form: UseFormReturn<FieldRepFormData>;
}

export const AspenGroveVerification = ({ form }: AspenGroveVerificationProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasNone, setHasNone] = useState(false);
  const { toast } = useToast();

  const handleNoneToggle = (checked: boolean) => {
    setHasNone(checked);
    if (checked) {
      // Clear all AspenGrove fields when "None" is selected
      form.setValue('aspenGroveId', '');
      form.setValue('aspenGroveExpiration', undefined);
      form.setValue('aspenGroveImage', '');
      setPreviewUrl(null);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload images",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/aspengrove-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('field-rep-credentials')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('field-rep-credentials')
        .getPublicUrl(data.path);

      form.setValue('aspenGroveImage', urlData.publicUrl);
      setPreviewUrl(urlData.publicUrl);

      toast({
        title: "Image uploaded",
        description: "Your AspenGrove credential image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    form.setValue('aspenGroveImage', '');
    setPreviewUrl(null);
  };

  const existingImageUrl = form.watch('aspenGroveImage');
  const displayUrl = previewUrl || existingImageUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">AspenGrove Verification</h3>
          <div className="text-xs bg-muted px-2 py-1 rounded">Unlocks More Work (if available)</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="aspengrove-none"
            checked={hasNone}
            onChange={(e) => handleNoneToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="aspengrove-none" className="text-sm">
            None
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AspenGrove ID */}
        <FormField
          control={form.control}
          name="aspenGroveId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AspenGrove ID</FormLabel>
              <FormControl>
                <Input placeholder="AG123456" {...field} disabled={hasNone} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Expiration Date */}
        <FormField
          control={form.control}
          name="aspenGroveExpiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      disabled={hasNone}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Image Upload */}
        <FormField
          control={form.control}
          name="aspenGroveImage"
          render={() => (
            <FormItem>
              <FormLabel>Credential Proof</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {!displayUrl ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="aspengrove-upload"
                        disabled={uploading || hasNone}
                      />
                      <label 
                        htmlFor="aspengrove-upload" 
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Max 5MB, JPG/PNG
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <Dialog>
                        <DialogTrigger asChild>
                          <img 
                            src={displayUrl} 
                            alt="AspenGrove Credential" 
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <img 
                            src={displayUrl} 
                            alt="AspenGrove Credential - Full View" 
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
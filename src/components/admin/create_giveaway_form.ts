import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Gift, Building } from 'lucide-react';

interface CreateGiveawayFormProps {
  onSuccess: () => void;
}

interface GiveawayFormData {
  type: 'monthly' | 'vendor';
  title: string;
  description: string;
  prizeDescription: string;
  prizeValue: number;
  entryCost: number;
  startDate: string;
  endDate: string;
  maxEntriesPerUser: number;
  sponsorType: 'clearmarket' | 'external_company' | 'vendor';
  vendorId?: string;
}

const CreateGiveawayForm = ({ onSuccess }: CreateGiveawayFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<GiveawayFormData>({
    type: 'monthly',
    title: '',
    description: '',
    prizeDescription: '',
    prizeValue: 0,
    entryCost: 5,
    startDate: '',
    endDate: '',
    maxEntriesPerUser: 10,
    sponsorType: 'clearmarket'
  });

  const handleInputChange = (field: keyof GiveawayFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.prizeDescription.trim()) {
      toast({
        title: "Validation Error", 
        description: "Prize description is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Start and end dates are required",
        variant: "destructive"
      });
      return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return false;
    }

    if (formData.entryCost < 1) {
      toast({
        title: "Validation Error",
        description: "Entry cost must be at least 1 RepPoint",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      if (formData.type === 'monthly') {
        // Create monthly giveaway
        const { error } = await supabase
          .from('monthly_giveaways')
          .insert({
            title: formData.title,
            description: formData.description,
            prize_description: formData.prizeDescription,
            prize_value: formData.prizeValue || null,
            start_date: formData.startDate,
            end_date: formData.endDate,
            entry_cost_rep_points: formData.entryCost,
            sponsor_type: formData.sponsorType,
            status: 'draft'
          });

        if (error) throw error;

      } else {
        // Create vendor network giveaway
        const { error } = await supabase
          .from('vendor_network_giveaways')
          .insert({
            vendor_id: formData.vendorId || user.id, // Default to current user if no vendor selected
            title: formData.title,
            description: formData.description,
            prize_description: formData.prizeDescription,
            entry_cost_rep_points: formData.entryCost,
            start_date: formData.startDate,
            end_date: formData.endDate,
            max_entries_per_user: formData.maxEntriesPerUser,
            status: 'draft'
          });

        if (error) throw error;
      }

      toast({
        title: "Giveaway Created!",
        description: `${formData.type === 'monthly' ? 'Monthly' : 'Vendor'} giveaway has been created successfully.`,
      });

      onSuccess();

    } catch (error) {
      console.error('Error creating giveaway:', error);
      toast({
        title: "Error",
        description: "Failed to create giveaway. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate suggested end date (30 days from start)
  const getSuggestedEndDate = (startDate: string) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 30);
    return end.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Giveaway Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Giveaway Type
          </CardTitle>
          <CardDescription>
            Choose the type of giveaway to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="monthly" id="monthly" />
              <div className="flex-1">
                <Label htmlFor="monthly" className="font-medium">Monthly ClearMarket Giveaway</Label>
                <p className="text-sm text-muted-foreground">
                  Platform-wide giveaway open to all active field reps
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="vendor" id="vendor" />
              <div className="flex-1">
                <Label htmlFor="vendor" className="font-medium">Vendor Network Giveaway</Label>
                <p className="text-sm text-muted-foreground">
                  Exclusive giveaway for a specific vendor's network members
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the core details for your giveaway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Giveaway Title</Label>
            <Input
              id="title"
              placeholder="e.g., Monthly $500 Amazon Gift Card Giveaway"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the giveaway, rules, and what participants can expect..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prizeDescription">Prize Description</Label>
              <Input
                id="prizeDescription"
                placeholder="e.g., $500 Amazon Gift Card"
                value={formData.prizeDescription}
                onChange={(e) => handleInputChange('prizeDescription', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeValue">Prize Value (Optional)</Label>
              <Input
                id="prizeValue"
                type="number"
                placeholder="500"
                value={formData.prizeValue || ''}
                onChange={(e) => handleInputChange('prizeValue', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Configuration</CardTitle>
          <CardDescription>
            Set up how users can enter the giveaway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryCost">Entry Cost (RepPoints)</Label>
              <Input
                id="entryCost"
                type="number"
                min="1"
                value={formData.entryCost}
                onChange={(e) => handleInputChange('entryCost', parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Cost per entry in RepPoints
              </p>
            </div>

            {formData.type === 'vendor' && (
              <div className="space-y-2">
                <Label htmlFor="maxEntries">Max Entries Per User</Label>
                <Input
                  id="maxEntries"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxEntriesPerUser}
                  onChange={(e) => handleInputChange('maxEntriesPerUser', parseInt(e.target.value) || 10)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum entries each user can purchase
                </p>
              </div>
            )}
          </div>

          {formData.type === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="sponsorType">Sponsor Type</Label>
              <Select
                value={formData.sponsorType}
                onValueChange={(value) => handleInputChange('sponsorType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clearmarket">ClearMarket</SelectItem>
                  <SelectItem value="external_company">External Company</SelectItem>
                  <SelectItem value="vendor">Vendor Sponsored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule
          </CardTitle>
          <CardDescription>
            Set when the giveaway will run
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => {
                  handleInputChange('startDate', e.target.value);
                  if (!formData.endDate) {
                    handleInputChange('endDate', getSuggestedEndDate(e.target.value));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Monthly giveaways typically run for 30 days. 
              Vendor giveaways can be shorter (1-2 weeks) for faster engagement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Selection for Vendor Type */}
      {formData.type === 'vendor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Vendor Information
            </CardTitle>
            <CardDescription>
              Specify which vendor this giveaway belongs to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor (Optional)</Label>
              <Input
                id="vendorId"
                placeholder="Leave blank to use current user as vendor"
                value={formData.vendorId || ''}
                onChange={(e) => handleInputChange('vendorId', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter vendor user ID, or leave blank to create for current user
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How this giveaway will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <h3 className="font-bold text-lg">{formData.title || 'Giveaway Title'}</h3>
            <p className="text-muted-foreground mb-2">
              {formData.description || 'Giveaway description will appear here...'}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Gift className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{formData.prizeDescription || 'Prize'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-medium">{formData.entryCost} RepPoints</span>
              </div>
              
              {formData.type === 'vendor' && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Max:</span>
                  <span className="font-medium">{formData.maxEntriesPerUser} entries</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Creating...' : 'Create Giveaway'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              type: 'monthly',
              title: '',
              description: '',
              prizeDescription: '',
              prizeValue: 0,
              entryCost: 5,
              startDate: '',
              endDate: '',
              maxEntriesPerUser: 10,
              sponsorType: 'clearmarket'
            });
          }}
        >
          Reset Form
        </Button>
      </div>
    </form>
  );
};

export default CreateGiveawayForm;

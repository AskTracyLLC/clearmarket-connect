import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuoteRequestFormProps {
  recipientName: string;
  recipientInitials: string;
  onSubmit?: (quoteData: QuoteRequest) => void;
  onCancel?: () => void;
}

interface QuoteRequest {
  inspectionType: string;
  targetDate: string;
  propertyZip: string;
  specialInstructions: string;
  feeRequest: string;
  urgency: string;
}

const QuoteRequestForm = ({ recipientName, recipientInitials, onSubmit, onCancel }: QuoteRequestFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<QuoteRequest>({
    inspectionType: "",
    targetDate: "",
    propertyZip: "",
    specialInstructions: "",
    feeRequest: "",
    urgency: "normal"
  });

  const inspectionTypes = [
    "Interior/Exterior Inspection",
    "Exterior Only Inspection",
    "Drive-by Inspection", 
    "Occupancy Verification",
    "REO Services",
    "Property Preservation",
    "Damage Assessment",
    "Marketing Photos",
    "Other"
  ];

  const urgencyOptions = [
    { value: "normal", label: "Normal (3-5 days)" },
    { value: "urgent", label: "Urgent (1-2 days)" },
    { value: "rush", label: "Rush (Same day)" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inspectionType || !formData.targetDate || !formData.propertyZip) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send the quote request
    onSubmit?.(formData);
    
    toast({
      title: "Quote Request Sent",
      description: `Your quote request has been sent to ${recipientName}.`,
    });
  };

  const handleInputChange = (field: keyof QuoteRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Request Quote from {recipientName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send a formal quote request with project details
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inspection Type */}
          <div className="space-y-2">
            <Label htmlFor="inspectionType" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Inspection Type *
            </Label>
            <Select value={formData.inspectionType} onValueChange={(value) => handleInputChange('inspectionType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select inspection type..." />
              </SelectTrigger>
              <SelectContent>
                {inspectionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Target Due Date *
            </Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleInputChange('targetDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Property Zip */}
          <div className="space-y-2">
            <Label htmlFor="propertyZip" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Property Zip Code *
            </Label>
            <Input
              id="propertyZip"
              value={formData.propertyZip}
              onChange={(e) => handleInputChange('propertyZip', e.target.value)}
              placeholder="Enter property zip code..."
              maxLength={5}
            />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Request */}
          <div className="space-y-2">
            <Label htmlFor="feeRequest" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fee Request
            </Label>
            <Select value={formData.feeRequest} onValueChange={(value) => handleInputChange('feeRequest', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee preference..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="propose">Please propose a fee</SelectItem>
                <SelectItem value="market">Market rate</SelectItem>
                <SelectItem value="budget">I have a specific budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special requirements, access instructions, or additional details..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Send Quote Request
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteRequestForm;
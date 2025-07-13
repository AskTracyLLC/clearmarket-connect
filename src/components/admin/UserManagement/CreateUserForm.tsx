import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFormData, isValidEmail, isValidUserRole } from "@/utils/security";
import { UserPlus, Send } from "lucide-react";

interface CreateUserFormProps {
  onUserInvited?: () => void;
}

export const CreateUserForm = ({ onUserInvited }: CreateUserFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '' as 'admin' | 'moderator' | ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize input data
    const sanitizedData = sanitizeFormData(formData);
    
    // Validation
    if (!sanitizedData.firstName.trim() || !sanitizedData.lastName.trim() || !sanitizedData.email.trim() || !sanitizedData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Additional security validation
    if (!isValidEmail(sanitizedData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUserRole(sanitizedData.role)) {
      toast({
        title: "Security Error",
        description: "Invalid user role selected",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: sanitizedData.email,
          role: sanitizedData.role,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${formData.email} successfully`,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
      });

      onUserInvited?.();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
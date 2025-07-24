import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStaffInvites } from '@/hooks/useStaffInvites';
import { UserPlus, Mail, Shield } from 'lucide-react';

const addStaffSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'manager', 'staff'], {
    required_error: 'Please select a role',
  }),
  personalMessage: z.string().optional(),
});

type AddStaffFormData = z.infer<typeof addStaffSchema>;

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorOrgId: string | null;
  onSuccess: () => void;
}

export const AddStaffModal = ({ isOpen, onClose, vendorOrgId, onSuccess }: AddStaffModalProps) => {
  const { sendStaffInvite, isInviting } = useStaffInvites(vendorOrgId);

  const form = useForm<AddStaffFormData>({
    resolver: zodResolver(addStaffSchema),
    defaultValues: {
      email: '',
      role: 'staff',
      personalMessage: '',
    },
  });

  const onSubmit = async (values: AddStaffFormData) => {
    const success = await sendStaffInvite({
      email: values.email,
      role: values.role,
      personalMessage: values.personalMessage,
    });
    if (success) {
      form.reset();
      onSuccess();
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Staff Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to add a new team member to your organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="colleague@company.com" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">Staff</div>
                            <div className="text-xs text-muted-foreground">Basic access to messaging and tools</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">Manager</div>
                            <div className="text-xs text-muted-foreground">Can manage projects and view reports</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">Admin</div>
                            <div className="text-xs text-muted-foreground">Full access including staff management</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Welcome to our team! We're excited to have you join us..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isInviting}
                className="flex-1"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
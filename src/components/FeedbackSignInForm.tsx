import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2 } from 'lucide-react';

export const FeedbackSignInForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      // Check if user exists in feedback group (either table)
      const [fieldRepResult, vendorResult] = await Promise.all([
        supabase
          .from('field_rep_signups')
          .select('*')
          .eq('email', email)
          .eq('join_feedback_group', true)
          .maybeSingle(),
        supabase
          .from('vendor_signups')
          .select('*')
          .eq('email', email)
          .eq('join_feedback_group', true)
          .maybeSingle()
      ]);

      let user = null;
      let userType = '';
      let tableName = '';
      
      if (fieldRepResult.data) {
        user = fieldRepResult.data;
        userType = 'field-rep';
        tableName = 'field_rep_signups';
      } else if (vendorResult.data) {
        user = vendorResult.data;
        userType = 'vendor';
        tableName = 'vendor_signups';
      }

      if (!user) {
        toast({
          title: "Email not found",
          description: "This email is not registered for the feedback group. Please sign up for access first.",
          variant: "destructive"
        });
        return;
      }

      // Generate new anonymous username if not exists
      let anonymousUsername = user.anonymous_username;
      if (!anonymousUsername) {
        const { data: usernameData, error: usernameError } = await supabase
          .rpc('generate_anonymous_username', { user_type_param: userType });
        
        if (usernameError) {
          console.error('Error generating username:', usernameError);
          toast({
            title: "Error",
            description: "Failed to generate username. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        anonymousUsername = usernameData;
        
        // Update the user with the new username
        if (userType === 'field-rep') {
          await supabase
            .from('field_rep_signups')
            .update({ anonymous_username: anonymousUsername })
            .eq('id', user.id);
        } else {
          await supabase
            .from('vendor_signups')
            .update({ anonymous_username: anonymousUsername })
            .eq('id', user.id);
        }
      }

      // Send feedback welcome email with new access link
      const { error: emailError } = await supabase.functions.invoke('send-feedback-welcome', {
        body: {
          email: email,
          anonymousUsername: anonymousUsername
        }
      });

      if (emailError) {
        console.error('Error sending welcome email:', emailError);
        toast({
          title: "Error sending email",
          description: "Failed to send access link. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Access link sent!",
        description: "Check your email for a new secure access link to the feedback group."
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error in sign in:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="text-left">
        <Label htmlFor="signin-email" className="text-sm font-medium">
          Already have access? Sign in with your email
        </Label>
        <div className="mt-2 space-y-2">
          <Input
            id="signin-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending access link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send me access link
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
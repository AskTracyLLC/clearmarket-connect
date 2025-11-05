import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export const PasswordChangeVerifier = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  const verifyPasswordChange = async () => {
    if (!email || !oldPassword || !newPassword) {
      setResult({
        type: 'error',
        message: 'All fields are required'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Step 1: Try to sign in with old password
      const { error: oldPasswordError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: oldPassword,
      });

      if (!oldPasswordError) {
        // Old password still works
        setResult({
          type: 'info',
          message: 'Old password still works',
          details: 'The password has NOT been changed. The old password is still active.'
        });
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Step 2: Try to sign in with new password
      const { data: newPasswordData, error: newPasswordError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: newPassword,
      });

      if (!newPasswordError && newPasswordData.user) {
        // New password works!
        setResult({
          type: 'success',
          message: '✅ Password change verified successfully!',
          details: `The new password is active and working. User can now log in with: ${email}`
        });
        await supabase.auth.signOut();
      } else if (newPasswordError?.message.includes('Invalid login credentials')) {
        // Neither password works
        setResult({
          type: 'error',
          message: 'Neither password works',
          details: 'Both the old and new passwords failed to authenticate. The password may have been changed to something different, or there may be an issue with the account.'
        });
      } else {
        setResult({
          type: 'error',
          message: 'Unable to verify password change',
          details: newPasswordError?.message || 'An unknown error occurred'
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: 'Verification failed',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (!result) return null;
    switch (result.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Password Change Verifier</CardTitle>
        <CardDescription>
          Verify if a password reset was successful by testing both old and new passwords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verify-email">Email Address</Label>
          <Input
            id="verify-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verify-old-password">Old Password (Before Reset)</Label>
          <Input
            id="verify-old-password"
            type="password"
            placeholder="Enter old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verify-new-password">New Password (After Reset)</Label>
          <Input
            id="verify-new-password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={verifyPasswordChange} 
          disabled={isLoading || !email || !oldPassword || !newPassword}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Password Change'
          )}
        </Button>

        {result && (
          <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1">
                <AlertDescription>
                  <p className="font-medium mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-sm text-muted-foreground">{result.details}</p>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <p className="font-medium mb-2">How this works:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Attempts to log in with the old password</li>
              <li>If old password works, password was NOT changed</li>
              <li>If old password fails, tries the new password</li>
              <li>Reports which password (if any) works</li>
              <li>Automatically signs out after testing</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

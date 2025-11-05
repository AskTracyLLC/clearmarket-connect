import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface LogEntry {
  step: string;
  status: 'pending' | 'success' | 'error' | 'info';
  message: string;
  timestamp: Date;
  details?: any;
}

export const PasswordResetTester = () => {
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gatewayLink, setGatewayLink] = useState<string>("");

  const addLog = (step: string, status: LogEntry['status'], message: string, details?: any) => {
    setLogs(prev => [...prev, {
      step,
      status,
      message,
      timestamp: new Date(),
      details
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
    setGatewayLink("");
  };

  const testPasswordReset = async () => {
    if (!email) {
      addLog("Validation", "error", "Email address is required");
      return;
    }

    setIsLoading(true);
    clearLogs();

    try {
      // Step 1: Check if user exists
      addLog("User Check", "pending", "Checking if user exists in database...");
      
      try {
        const userQuery = await supabase
          .from('users')
          .select('id, email, role')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (userQuery.error) {
          addLog("User Check", "error", "Database error", { error: userQuery.error.message });
        } else if (!userQuery.data) {
          addLog("User Check", "error", "User not found in database");
        } else {
          addLog("User Check", "success", `User found: ${userQuery.data.email} (Role: ${userQuery.data.role})`, {
            id: userQuery.data.id,
            email: userQuery.data.email,
            role: userQuery.data.role
          });
        }
      } catch (err: any) {
        addLog("User Check", "error", "Exception during user check", { error: err.message });
      }

      // Step 2: Call send-password-reset edge function
      addLog("Edge Function", "pending", "Calling send-password-reset edge function...");
      
      const startTime = Date.now();
      const { data: resetData, error: resetError } = await supabase.functions.invoke(
        'send-password-reset',
        {
          body: { email: email.toLowerCase() }
        }
      );
      const duration = Date.now() - startTime;

      if (resetError) {
        addLog("Edge Function", "error", `Failed to send reset email (${duration}ms)`, {
          error: resetError.message,
          details: resetError
        });
      } else {
        addLog("Edge Function", "success", `Edge function completed successfully (${duration}ms)`, resetData);
      }

      // Step 3: Check email template
      addLog("Email Template", "pending", "Checking password-reset email template...");
      
      try {
        const templateQuery = await supabase
          .from('email_templates')
          .select('id, name, subject, html_content')
          .eq('name', 'password-reset')
          .maybeSingle();

        if (templateQuery.error) {
          addLog("Email Template", "error", "Error fetching template", { error: templateQuery.error.message });
        } else if (!templateQuery.data) {
          addLog("Email Template", "error", "Password reset template not found in database");
        } else {
          addLog("Email Template", "success", "Email template retrieved successfully", {
            name: templateQuery.data.name,
            subject: templateQuery.data.subject || "N/A",
            hasContent: !!templateQuery.data.html_content
          });
        }
      } catch (err: any) {
        addLog("Email Template", "error", "Exception checking template", { error: err.message });
      }

      // Step 4: Generate gateway link
      addLog("Gateway Link", "info", "Generating password reset gateway link...");
      
      const gatewayUrl = `https://useclearmarket.io/password-reset-gateway?email=${encodeURIComponent(email)}`;
      setGatewayLink(gatewayUrl);
      
      addLog("Gateway Link", "success", "Gateway link generated", { link: gatewayUrl });

      // Step 5: Check edge function logs
      addLog("Function Logs", "info", "Check Supabase logs for send-password-reset function execution details");

      // Step 6: Environment check
      addLog("Environment", "info", "Verifying environment configuration...");
      
      const envChecks = {
        supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };
      
      addLog("Environment", "success", "Environment variables verified", envChecks);

      // Final summary
      const hasErrors = logs.some(log => log.status === 'error');
      if (!hasErrors && !resetError) {
        addLog("Summary", "success", "✅ Password reset flow initiated successfully! Check email for reset link.");
      } else {
        addLog("Summary", "error", "❌ Password reset flow encountered errors. Review logs above.");
      }

    } catch (error: any) {
      addLog("System Error", "error", "Unexpected error occurred", {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />;
      case 'info':
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: LogEntry['status']) => {
    const variants: Record<LogEntry['status'], any> = {
      success: 'default',
      error: 'destructive',
      pending: 'secondary',
      info: 'outline'
    };
    return variants[status];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Password Reset Flow Tester</CardTitle>
        <CardDescription>
          Test the complete password reset flow with detailed logging at each step
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testPasswordReset} 
              disabled={isLoading || !email}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Start Test'
              )}
            </Button>
            <Button 
              onClick={clearLogs} 
              variant="outline"
              disabled={isLoading || logs.length === 0}
            >
              Clear Logs
            </Button>
          </div>
        </div>

        {/* Gateway Link Display */}
        {gatewayLink && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <span className="font-medium">Gateway Link:</span>
              <a 
                href={gatewayLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {gatewayLink.substring(0, 60)}...
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Logs Display */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Execution Log</h3>
              <Badge variant="outline">{logs.length} entries</Badge>
            </div>
            
            <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadge(log.status)} className="text-xs">
                            {log.step}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.details && (
                          <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    {index < logs.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Instructions */}
        {logs.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">How to use this tester:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Enter an email address (user should exist in the system)</li>
                  <li>Click "Start Test" to initiate the password reset flow</li>
                  <li>Review the detailed logs for each step of the process</li>
                  <li>Check for any errors or warnings in the execution log</li>
                  <li>Click the generated gateway link to test the full flow</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Mail, Users, MessageSquare } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export const TestingDashboard = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const { toast } = useToast();

  const updateTestResult = (name: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message } : r);
      }
      return [...prev, { name, status, message }];
    });
  };

  const testAnonymousUsername = async () => {
    updateTestResult('Anonymous Username', 'pending', 'Testing username generation...');
    
    try {
      const { data: username, error } = await supabase
        .rpc('generate_anonymous_username', { user_type_param: 'vendor' });
      
      if (error) throw error;
      
      setGeneratedUsername(username);
      updateTestResult('Anonymous Username', 'success', `Generated: ${username}`);
    } catch (error: any) {
      updateTestResult('Anonymous Username', 'error', `Error: ${error.message}`);
    }
  };

  const testPreLaunchSignup = async () => {
    updateTestResult('Pre-launch Signup', 'pending', 'Testing signup with feedback group...');
    
    try {
      // Test signup for vendor
      const { error: signupError } = await supabase
        .from('vendor_signups')
        .insert({
          email: testEmail,
          company_name: 'Test Company',
          join_feedback_group: true,
          anonymous_username: generatedUsername || 'TestUser#999'
        });

      if (signupError && signupError.code !== '23505') { // Ignore duplicate email error
        throw signupError;
      }

      updateTestResult('Pre-launch Signup', 'success', 'Signup completed successfully');
    } catch (error: any) {
      updateTestResult('Pre-launch Signup', 'error', `Error: ${error.message}`);
    }
  };

  const testFeedbackWelcomeEmail = async () => {
    updateTestResult('Feedback Welcome Email', 'pending', 'Sending welcome email...');
    
    try {
      const { error } = await supabase.functions.invoke('send-feedback-welcome', {
        body: {
          email: testEmail,
          anonymousUsername: generatedUsername || 'TestUser#999'
        }
      });

      if (error) throw error;

      updateTestResult('Feedback Welcome Email', 'success', 'Welcome email sent successfully');
    } catch (error: any) {
      updateTestResult('Feedback Welcome Email', 'error', `Error: ${error.message}`);
    }
  };

  const testFeedbackAccess = async () => {
    updateTestResult('Feedback Access', 'pending', 'Testing feedback token validation...');
    
    try {
      // Get the latest feedback session for the test email
      const { data: session, error } = await supabase
        .from('feedback_sessions')
        .select('*')
        .eq('user_email', testEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (session && new Date(session.expires_at) > new Date()) {
        updateTestResult('Feedback Access', 'success', `Token valid until: ${new Date(session.expires_at).toLocaleString()}`);
      } else {
        updateTestResult('Feedback Access', 'error', 'No valid token found');
      }
    } catch (error: any) {
      updateTestResult('Feedback Access', 'error', `Error: ${error.message}`);
    }
  };

  const testCommunityPosts = async () => {
    updateTestResult('Community Posts', 'pending', 'Testing community posts table...');
    
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, content, created_at, users(display_name)')
        .limit(5);

      if (error) throw error;

      updateTestResult('Community Posts', 'success', `Found ${data?.length || 0} community posts`);
    } catch (error: any) {
      updateTestResult('Community Posts', 'error', `Error: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testAnonymousUsername();
    await testPreLaunchSignup();
    await testFeedbackWelcomeEmail();
    await testFeedbackAccess();
    await testCommunityPosts();
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pre-Launch Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test the complete signup → email → feedback access flow
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Email</label>
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="mt-1"
              />
            </div>
            
            {generatedUsername && (
              <div>
                <label className="text-sm font-medium">Generated Username</label>
                <div className="mt-1 p-2 bg-muted rounded border">
                  {generatedUsername}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={testAnonymousUsername} variant="outline" size="sm">
                1. Test Username Generation
              </Button>
              <Button onClick={testPreLaunchSignup} variant="outline" size="sm">
                2. Test Pre-launch Signup
              </Button>
              <Button onClick={testFeedbackWelcomeEmail} variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                3. Test Welcome Email
              </Button>
              <Button onClick={testFeedbackAccess} variant="outline" size="sm">
                4. Test Feedback Access
              </Button>
              <Button onClick={testCommunityPosts} variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                5. Test Community Posts
              </Button>
            </div>

            <Button onClick={runAllTests} className="w-full">
              Run All Tests
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tests run yet. Click "Run All Tests" to start.
              </p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{result.name}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Test Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
              Test Signup Form
            </Button>
            <Button variant="outline" onClick={() => window.open('/feedback', '_blank')}>
              Test Feedback Page
            </Button>
            <Button variant="outline" onClick={() => window.open('https://resend.com/domains', '_blank')}>
              Check Email Domain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
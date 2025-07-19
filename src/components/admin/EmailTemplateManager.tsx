import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SecureHtmlPreview } from '@/components/ui/secure-html-preview';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Eye, 
  RefreshCw,
  Edit,
  Send,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  created_at: string;
  updated_at: string;
}

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', html_content: '' });
  const [testEmail, setTestEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Helper function to extract text content from HTML
  const extractTextFromHtml = (html: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content and clean it up
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
  };

  // Helper function to update HTML with new text content
  const updateHtmlWithText = (originalHtml: string, newText: string): string => {
    // Split new text into lines for processing
    const lines = newText.split('\n').filter(line => line.trim());
    
    let updatedHtml = originalHtml;
    
    // Replace main heading (Welcome message)
    updatedHtml = updatedHtml.replace(
      /(Welcome to ClearMarket[^!]*!?)/gi,
      lines[0] || 'Welcome to ClearMarket!'
    );
    
    // Replace main content paragraphs
    if (lines.length > 1) {
      const mainContent = lines.slice(1).join(' ');
      
      // Replace the main descriptive paragraph
      updatedHtml = updatedHtml.replace(
        /(We're excited to have you[^<]*|Congratulations![^<]*|Thank you for joining[^<]*)/gi,
        mainContent.substring(0, 200) || 'Thank you for joining ClearMarket!'
      );
    }
    
    return updatedHtml;
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          html_content: template.html_content,
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template updated successfully",
      });

      await fetchTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const createTemplate = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: newTemplate.name,
          subject: newTemplate.subject,
          html_content: newTemplate.html_content,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template created successfully",
      });

      await fetchTemplates();
      setNewTemplate({ name: '', subject: '', html_content: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId: number) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
    }
  };

  const sendTestEmail = async () => {
    if (!sendingTemplate || !testEmail) return;

    try {
      setSending(true);
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: sendingTemplate.subject,
          html: sendingTemplate.html_content,
          template_name: sendingTemplate.name,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Test email sent to ${testEmail}`,
      });

      setSendingTemplate(null);
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Management
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTemplates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Email Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Email templates are created automatically by the system.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Subject: {template.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSendingTemplate(template)}
                        >
                          <Send className="h-3 w-3" />
                          Send
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this template?')) {
                              deleteTemplate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Preview: {previewTemplate.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Email Client Mockup */}
                <div className="border rounded-lg bg-gray-50 p-4">
                  {/* Email Header */}
                  <div className="bg-white border rounded-lg shadow-sm">
                    <div className="border-b bg-gray-100 px-4 py-3 rounded-t-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">ClearMarket</div>
                            <div className="text-gray-600">noreply@clearmarket.com</div>
                          </div>
                        </div>
                        <div className="text-gray-500">
                          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-b bg-gray-50">
                      <div className="text-sm">
                        <span className="font-semibold">To:</span> recipient@example.com
                      </div>
                      <div className="text-sm mt-1">
                        <span className="font-semibold">Subject:</span> {previewTemplate.subject}
                      </div>
                    </div>
                    {/* Email Body */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <meta charset="utf-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <style>
                                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                /* Reset styles for email clients */
                                table { border-collapse: collapse; }
                                img { max-width: 100%; height: auto; }
                              </style>
                            </head>
                            <body>
                              ${previewTemplate.html_content.replace(/\{\{anonymous_username\}\}/g, 'TestUser#123')}
                            </body>
                          </html>
                        `}
                        className="w-full h-[400px] border-0"
                        sandbox="allow-same-origin"
                        title="Email Preview"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Preview shows how the email will appear to recipients
                  </div>
                  <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                    Close Preview
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {editingTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Email Template: {editingTemplate.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Edit the text content of this email template. HTML formatting will be preserved.
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input
                    id="edit-name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subject">Email Subject</Label>
                  <Input
                    id="edit-subject"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="Enter email subject"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can use placeholders like: {`{{anonymous_username}}`}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-body">Email Body Text</Label>
                  <Textarea
                    id="edit-body"
                    value={extractTextFromHtml(editingTemplate.html_content)}
                    onChange={(e) => {
                      const updatedHtml = updateHtmlWithText(editingTemplate.html_content, e.target.value);
                      setEditingTemplate({ ...editingTemplate, html_content: updatedHtml });
                    }}
                    placeholder="Enter the main email text content"
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Edit the main text content. HTML formatting and styling will be preserved.
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Preview</h4>
                  <div className="max-h-32 overflow-y-auto bg-background p-3 rounded border">
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <style>
                              body { margin: 0; padding: 10px; font-family: Arial, sans-serif; font-size: 12px; }
                              * { max-width: 100%; }
                            </style>
                          </head>
                          <body>
                            ${editingTemplate.html_content.replace(/\{\{anonymous_username\}\}/g, 'TestUser#123')}
                          </body>
                        </html>
                      `}
                      className="w-full h-24 border-0"
                      sandbox="allow-same-origin"
                      title="Email Preview"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveTemplate(editingTemplate)} disabled={saving}>
                    {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Test Email Dialog */}
      <Dialog open={!!sendingTemplate} onOpenChange={(open) => !open && setSendingTemplate(null)}>
        <DialogContent>
          {sendingTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>Send Test Email: {sendingTemplate.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to send test"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Subject:</strong> {sendingTemplate.subject}</p>
                  <p><strong>Template:</strong> {sendingTemplate.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={sendTestEmail} 
                    disabled={sending || !testEmail}
                  >
                    {sending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    {sending ? 'Sending...' : 'Send Test Email'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSendingTemplate(null);
                    setTestEmail('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;
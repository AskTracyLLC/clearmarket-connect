import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Save, 
  Send
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_templates')
        .select('*')
        .eq('template_type', 'email')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTemplates = data?.map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? template.variables 
          : (template.variables ? JSON.parse(template.variables) : [])
      })) || [];

      setTemplates(formattedTemplates);
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('system_templates')
        .insert([{
          template_name: formData.template_name,
          template_type: 'email',
          subject: formData.subject,
          html_content: formData.html_content,
          text_content: formData.text_content,
          variables: JSON.stringify(formData.variables.split(',').map((v: string) => v.trim())),
          is_active: formData.is_active
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template created successfully",
      });

      setIsCreateDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('system_templates')
        .update({
          ...updates,
          variables: typeof updates.variables === 'string' 
            ? JSON.stringify(updates.variables.split(',').map((v: string) => v.trim()))
            : JSON.stringify(updates.variables),
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template updated successfully",
      });

      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('system_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = async (template: EmailTemplate) => {
    try {
      const variables: Record<string, string> = {};
      template.variables.forEach(variable => {
        variables[variable] = testVariables[variable] || `[${variable}]`;
      });

      const response = await supabase.functions.invoke('send-email', {
        body: {
          templateName: template.template_name,
          toEmail: testEmail,
          variables: variables
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const CreateTemplateDialog = () => {
    const [formData, setFormData] = useState({
      template_name: '',
      subject: '',
      html_content: '',
      text_content: '',
      variables: '',
      is_active: true
    });

    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template_name">Template Name</Label>
                <Input
                  id="template_name"
                  value={formData.template_name}
                  onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                  placeholder="e.g., welcome_email"
                />
              </div>
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Welcome to ClearMarket!"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="variables">Variables (comma-separated)</Label>
              <Input
                id="variables"
                value={formData.variables}
                onChange={(e) => setFormData({...formData, variables: e.target.value})}
                placeholder="user_name, company_name, activation_link"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use {{variable_name}} in your template content
              </p>
            </div>

            <div>
              <Label htmlFor="html_content">HTML Content</Label>
              <Textarea
                id="html_content"
                value={formData.html_content}
                onChange={(e) => setFormData({...formData, html_content: e.target.value})}
                placeholder="<h1>Welcome {{user_name}}!</h1><p>Thank you for joining ClearMarket...</p>"
                className="min-h-[200px] font-mono"
              />
            </div>

            <div>
              <Label htmlFor="text_content">Plain Text Content</Label>
              <Textarea
                id="text_content"
                value={formData.text_content}
                onChange={(e) => setFormData({...formData, text_content: e.target.value})}
                placeholder="Welcome {{user_name}}! Thank you for joining ClearMarket..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Template is active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleCreateTemplate(formData)}
                disabled={!formData.template_name || !formData.subject || !formData.html_content}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const EditTemplateDialog = () => {
    if (!editingTemplate) return null;

    const [formData, setFormData] = useState({
      template_name: editingTemplate.template_name,
      subject: editingTemplate.subject,
      html_content: editingTemplate.html_content,
      text_content: editingTemplate.text_content || '',
      variables: editingTemplate.variables.join(', '),
      is_active: editingTemplate.is_active
    });

    return (
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template: {editingTemplate.template_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_template_name">Template Name</Label>
                <Input
                  id="edit_template_name"
                  value={formData.template_name}
                  onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_subject">Email Subject</Label>
                <Input
                  id="edit_subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_variables">Variables (comma-separated)</Label>
              <Input
                id="edit_variables"
                value={formData.variables}
                onChange={(e) => setFormData({...formData, variables: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit_html_content">HTML Content</Label>
              <Textarea
                id="edit_html_content"
                value={formData.html_content}
                onChange={(e) => setFormData({...formData, html_content: e.target.value})}
                className="min-h-[200px] font-mono"
              />
            </div>

            <div>
              <Label htmlFor="edit_text_content">Plain Text Content</Label>
              <Textarea
                id="edit_text_content"
                value={formData.text_content}
                onChange={(e) => setFormData({...formData, text_content: e.target.value})}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="edit_is_active">Template is active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => handleUpdateTemplate(editingTemplate.id, formData)}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const PreviewDialog = () => {
    if (!previewTemplate) return null;

    return (
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate.template_name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="html">
            <TabsList>
              <TabsTrigger value="html">HTML Preview</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
              <TabsTrigger value="test">Send Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Subject: {previewTemplate.subject}</p>
                <div 
                  className="border rounded p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Subject: {previewTemplate.subject}</p>
                <pre className="whitespace-pre-wrap text-sm">
                  {previewTemplate.text_content || 'No plain text version available'}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test_email">Test Email Address</Label>
                  <Input
                    id="test_email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                
                {previewTemplate.variables.length > 0 && (
                  <div>
                    <Label>Template Variables</Label>
                    <div className="space-y-2 mt-2">
                      {previewTemplate.variables.map(variable => (
                        <div key={variable} className="flex gap-2 items-center">
                          <Label className="w-32">{variable}:</Label>
                          <Input
                            value={testVariables[variable] || ''}
                            onChange={(e) => setTestVariables({
                              ...testVariables,
                              [variable]: e.target.value
                            })}
                            placeholder={`Enter ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleTestEmail(previewTemplate)}
                  disabled={!testEmail}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

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
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
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
                  Create your first email template to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.template_name}</h3>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Subject: {template.subject}
                        </p>
                        <div className="flex gap-1 flex-wrap mb-2">
                          {template.variables.slice(0, 3).map(variable => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(template.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this template?')) {
                              handleDeleteTemplate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
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

      <CreateTemplateDialog />
      <EditTemplateDialog />
      <PreviewDialog />
    </div>
  );
};

export default EmailTemplateManager;

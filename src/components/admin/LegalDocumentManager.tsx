import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  version: string;
  is_active: boolean;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const LegalDocumentManager = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  
  // Form state
  const [documentType, setDocumentType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("1.0");

  useEffect(() => {
    loadLegalDocuments();
  }, []);

  const loadLegalDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading legal documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!documentType || !title || !content) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('legal_documents')
        .insert([{
          document_type: documentType,
          title,
          content,
          version,
          is_active: false, // Start as inactive until approved
          metadata: {}
        }]);

      if (error) throw error;

      toast({
        title: "Legal document created",
        description: "Document created successfully and pending approval"
      });

      resetForm();
      setIsCreateOpen(false);
      loadLegalDocuments();
    } catch (error: any) {
      toast({
        title: "Error creating document",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingDoc || !title || !content) return;

    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({
          title,
          content,
          version,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDoc.id);

      if (error) throw error;

      toast({
        title: "Document updated",
        description: "Legal document updated successfully"
      });

      setEditingDoc(null);
      resetForm();
      loadLegalDocuments();
    } catch (error: any) {
      toast({
        title: "Error updating document",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleActivate = async (docId: string, activate: boolean) => {
    try {
      // If activating, deactivate all other documents of the same type first
      if (activate) {
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          await supabase
            .from('legal_documents')
            .update({ is_active: false })
            .eq('document_type', doc.document_type);
        }
      }

      const { error } = await supabase
        .from('legal_documents')
        .update({ 
          is_active: activate,
          approved_at: activate ? new Date().toISOString() : null
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: activate ? "Document activated" : "Document deactivated",
        description: `Legal document ${activate ? 'activated and published' : 'deactivated'}`
      });

      loadLegalDocuments();
    } catch (error: any) {
      toast({
        title: "Error updating document status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const startEdit = (doc: LegalDocument) => {
    setEditingDoc(doc);
    setDocumentType(doc.document_type);
    setTitle(doc.title);
    setContent(doc.content);
    setVersion(doc.version);
  };

  const resetForm = () => {
    setDocumentType("");
    setTitle("");
    setContent("");
    setVersion("1.0");
  };

  const getStatusBadge = (doc: LegalDocument) => {
    if (doc.is_active) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Document Management
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Legal Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doc-type">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nda">NDA (Non-Disclosure Agreement)</SelectItem>
                      <SelectItem value="terms">Terms of Service</SelectItem>
                      <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                      <SelectItem value="service_agreement">Service Agreement</SelectItem>
                      <SelectItem value="vendor_agreement">Vendor Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Document Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the full legal document content..."
                    rows={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use HTML tags for formatting if needed
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} className="flex-1">
                    Create Document
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No legal documents yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create legal documents like NDAs, terms of service, and privacy policies
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50">
                {editingDoc?.id === doc.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Version</Label>
                      <Input
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingDoc(null);
                          resetForm();
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{doc.title}</h4>
                        {getStatusBadge(doc)}
                        <Badge variant="outline">v{doc.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {format(new Date(doc.created_at), "MMM d, yyyy")}
                        {doc.approved_at && ` • Approved ${format(new Date(doc.approved_at), "MMM d, yyyy")}`}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {doc.content.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={doc.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleActivate(doc.id, !doc.is_active)}
                      >
                        {doc.is_active ? (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
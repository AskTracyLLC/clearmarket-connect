import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { generateAndSaveNDA } from "@/utils/ndaDocument";
import { useNDAStatus } from "@/hooks/useNDAStatus";
import { 
  Upload, 
  FileText, 
  Shield, 
  Calendar, 
  Download, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Plus,
  Crown,
  HardDrive,
  Folder,
  FolderOpen,
  Users,
  Lock,
  Globe
} from "lucide-react";
import { format } from "date-fns";

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_date?: string;
  created_at?: string;
  expiration_date?: string;
  status?: 'active' | 'expired' | 'revoked' | 'pending';
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  visibility?: 'private' | 'public' | 'network_shared';
  folder_category?: 'legal' | 'profile' | 'credentials' | 'identity' | 'general';
  metadata: any;
}

interface UserStorageInfo {
  subscription_tier: string;
  storage_limit_mb: number;
  storage_used_mb: number;
}

interface DocumentTypeConfig {
  id: string;
  document_type: string;
  display_name: string;
  description: string;
  required_for_roles: string[];
  requires_expiration: boolean;
  max_file_size: number;
  allowed_mime_types: string[];
  verification_required: boolean;
  display_order: number;
  default_visibility?: 'private' | 'public' | 'network_shared';
  default_folder_category?: 'legal' | 'profile' | 'credentials' | 'identity' | 'general';
}

interface DocumentUploadProps {
  onDocumentAdded?: (document: UserDocument) => void;
}

const UserDocuments = ({ onDocumentAdded }: DocumentUploadProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { hasSignedNDA } = useNDAStatus();
  
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeConfig[]>([]);
  const [storageInfo, setStorageInfo] = useState<UserStorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Upload form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState<'private' | 'public' | 'network_shared'>('private');
  const [selectedFolderCategory, setSelectedFolderCategory] = useState<'legal' | 'profile' | 'credentials' | 'identity' | 'general'>('general');
  const [activeFolder, setActiveFolder] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadDocumentTypes();
      loadStorageInfo();
    }
  }, [user]);

  // Auto-generate NDA if signed but document is missing
  useEffect(() => {
    const generateMissingNDA = async () => {
      if (!user || !hasSignedNDA || !documents || loading) return;
      
      // Check if user has NDA document
      const hasNDADoc = documents.some(doc => doc.document_type === 'nda' || doc.folder_category === 'legal');
      
      if (!hasNDADoc) {
        console.log('🔄 NDA signed but document missing. Auto-generating...');
        
        try {
          // Fetch user details for NDA generation including signature data
          const { data: userData } = await supabase
            .from('users')
            .select('anonymous_username, role')
            .eq('id', user.id)
            .single();
          
          const result = await generateAndSaveNDA({
            userId: user.id,
            email: user.email,
            username: userData?.anonymous_username
          });
          
          if (result) {
            console.log('✅ NDA document auto-generated successfully');
            toast({
              title: "NDA Document Generated",
              description: "Your signed NDA has been added to your documents.",
            });
            // Reload documents to show the new NDA
            loadDocuments();
          }
        } catch (error) {
          console.error('❌ Failed to auto-generate NDA:', error);
        }
      }
    };

    generateMissingNDA();
  }, [user, hasSignedNDA, documents, loading]);

  const loadStorageInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier, storage_limit_mb, storage_used_mb')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      
      setStorageInfo({
        subscription_tier: data.subscription_tier || 'standard',
        storage_limit_mb: data.storage_limit_mb || 100,
        storage_used_mb: data.storage_used_mb || 0
      });
    } catch (error: any) {
      console.error('Error loading storage info:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []).map(doc => ({
        ...doc,
        upload_date: doc.upload_date || doc.created_at,
        status: doc.status as 'active' | 'expired' | 'revoked' | 'pending' || 'pending',
        visibility: doc.visibility as 'private' | 'public' | 'network_shared' || 'private',
        folder_category: doc.folder_category as 'legal' | 'profile' | 'credentials' | 'identity' | 'general' || 'general'
      })));
    } catch (error: any) {
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('document_type_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setDocumentTypes((data || []).map(type => ({
        ...type,
        default_visibility: type.default_visibility as 'private' | 'public' | 'network_shared' || 'private',
        default_folder_category: type.default_folder_category as 'legal' | 'profile' | 'credentials' | 'identity' | 'general' || 'general'
      })));
    } catch (error: any) {
      console.error('Error loading document types:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF, JPG, or PNG file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    if (!documentName) {
      setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType || !documentName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file, document type, and provide a name",
        variant: "destructive"
      });
      return;
    }

    // Check storage limits
    if (storageInfo) {
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      const availableSpace = storageInfo.storage_limit_mb - storageInfo.storage_used_mb;
      
      if (fileSizeMB > availableSpace) {
        toast({
          title: "Storage limit exceeded",
          description: `File size (${fileSizeMB.toFixed(1)}MB) exceeds available storage (${availableSpace.toFixed(1)}MB). Please upgrade your plan or remove unused documents.`,
          variant: "destructive"
        });
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${documentName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const filePath = `${user!.id}/${selectedDocType}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save document metadata
      const documentData = {
        user_id: user!.id,
        document_type: selectedDocType,
        document_name: documentName.trim(),
        file_path: uploadData.path,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        visibility: selectedVisibility,
        folder_category: selectedFolderCategory,
        expiration_date: expirationDate || null,
        status: 'pending',
        metadata: {
          original_filename: selectedFile.name,
          notes: notes.trim() || null
        }
      };

      const { data: docData, error: docError } = await supabase
        .from('user_documents')
        .insert([documentData])
        .select()
        .single();

      if (docError) throw docError;

      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and is pending verification"
      });

      // Reset form
      setSelectedFile(null);
      setSelectedDocType("");
      setDocumentName("");
      setExpirationDate("");
      setNotes("");
      setSelectedVisibility('private');
      setSelectedFolderCategory('general');
      setIsUploadOpen(false);

      // Reload documents
      loadDocuments();
      loadStorageInfo(); // Refresh storage usage
      
      // Notify parent component
      onDocumentAdded?.({
        ...docData,
        upload_date: docData.upload_date || docData.created_at,
        status: docData.status as 'active' | 'expired' | 'revoked' | 'pending' || 'pending',
        visibility: docData.visibility as 'private' | 'public' | 'network_shared' || 'private',
        folder_category: docData.folder_category as 'legal' | 'profile' | 'credentials' | 'identity' | 'general' || 'general'
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (document: UserDocument) => {
    try {
      console.log('🔽 Attempting to download document:', {
        file_path: document.file_path,
        document_name: document.document_name,
        document_type: document.document_type
      });

      // Build a friendly filename that always includes Anonymous Username and date
      const meta = (document as any)?.metadata || {};
      const anonUser = (meta.username as string | undefined) || '';
      const signedAt: string = (meta.signed_at as string | undefined) || new Date().toISOString();
      const datePart = new Date(signedAt).toISOString().slice(0, 10);
      const baseNameUnsafe = `${anonUser ? `${anonUser}_` : ''}NDA_${datePart}`;
      const baseName = baseNameUnsafe.replace(/[\\/:*?"<>|]+/g, '_');
      const ext = (document as any)?.mime_type?.includes('pdf') || document.file_path.endsWith('.pdf') ? 'pdf' : 'bin';

      // Helper to attempt a download for a given path; returns true on success
      const downloadByPath = async (path: string): Promise<boolean> => {
        const { data: signed, error: signError } = await supabase.storage
          .from('user-documents')
          .createSignedUrl(path, 120);

        if (signError || !signed?.signedUrl) {
          // If the object is missing, signal caller to try a fresh path
          if ((signError as any)?.message?.includes('Object not found')) {
            console.error('❌ Signed URL failed: object not found for', path);
            return false;
          }
          console.warn('⚠️ Signed URL failed, attempting direct download as fallback:', signError);
          const { data, error } = await supabase.storage
            .from('user-documents')
            .download(path);
          if (error) {
            console.error('❌ Direct download also failed for', path, error);
            return false;
          }
          const blobUrl = URL.createObjectURL(data);
          const a = window.document.createElement('a');
          a.href = blobUrl;
          a.download = `${baseName}.${ext}`;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          return true;
        }

        // Use the signed URL to fetch a Blob so we can control the filename
        try {
          const res = await fetch(signed.signedUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status} while downloading file`);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = blobUrl;
          a.download = `${baseName}.${ext}`;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          return true;
        } catch (fetchErr) {
          console.warn('⚠️ Blob fetch failed, opening signed URL directly as fallback', fetchErr);
          const a = window.document.createElement('a');
          a.href = signed.signedUrl;
          a.rel = 'noopener';
          a.target = '_blank';
          a.setAttribute('download', `${baseName}.${ext}`);
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          return true;
        }
      };

      // First try the current file_path
      let success = await downloadByPath(document.file_path);

      if (!success && document.document_type === 'nda' && user?.id) {
        console.log('🔁 Original path missing. Fetching latest NDA path and retrying...');
        const { data: latest, error: latestErr } = await supabase
          .from('user_documents')
          .select('file_path, mime_type, metadata')
          .eq('user_id', user.id)
          .eq('document_type', 'nda')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latest?.file_path) {
          // Try latest DB path first
          if (latest.file_path !== document.file_path) {
            success = await downloadByPath(latest.file_path);
          } else {
            success = await downloadByPath(latest.file_path);
          }

          // If still not successful, list storage folder directly and try the most recent file
          if (!success) {
            const prefix = `${user.id}/nda`;
            const { data: files, error: listErr } = await supabase.storage
              .from('user-documents')
              .list(prefix, { limit: 10, sortBy: { column: 'updated_at', order: 'desc' } });

            if (listErr) {
              console.error('❌ Failed to list NDA folder in storage:', listErr);
            }

            const latestFile = files?.[0]?.name;
            if (latestFile) {
              const latestPath = `${prefix}/${latestFile}`;
              console.log('🔎 Trying latest storage file:', latestPath);
              success = await downloadByPath(latestPath);
            }
          }

          if (success) {
            // Refresh list so UI reflects the latest file
            loadDocuments();
          }
        } else if (latestErr) {
          console.error('❌ Failed to fetch latest NDA record:', latestErr);
        }
      }

      if (!success) {
        throw new Error('File not found or could not be downloaded. Please try again.');
      }

      toast({
        title: 'Download successful',
        description: `${baseName}.${ext} downloaded successfully`
      });
    } catch (error: any) {
      console.error('❌ Download failed:', error);
      toast({
        title: 'Download failed',
        description: error.message || 'Unable to download file. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (document: UserDocument) => {
    if (document.verified_by) {
      toast({
        title: "Cannot delete verified document",
        description: "Verified documents cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast({
        title: "Document deleted",
        description: "Document has been removed successfully"
      });

      loadDocuments();

    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };


  const getStatusIcon = (status: string, verifiedBy?: string) => {
    switch (status) {
      case 'active':
        return verifiedBy ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string, verifiedBy?: string) => {
    if (status === 'active' && verifiedBy) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="secondary">Pending Review</Badge>;
    } else if (status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="outline">Active</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const selectedDocTypeConfig = documentTypes.find(dt => dt.document_type === selectedDocType);

  // Update visibility and folder when document type changes
  const handleDocTypeChange = (docType: string) => {
    setSelectedDocType(docType);
    const config = documentTypes.find(dt => dt.document_type === docType);
    if (config) {
      setSelectedVisibility(config.default_visibility || 'private');
      setSelectedFolderCategory(config.default_folder_category || 'general');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-600" />;
      case 'network_shared': return <Users className="h-4 w-4 text-blue-600" />;
      default: return <Lock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Badge variant="default" className="bg-green-100 text-green-800">Public</Badge>;
      case 'network_shared': return <Badge variant="default" className="bg-blue-100 text-blue-800">Network</Badge>;
      default: return <Badge variant="outline">Private</Badge>;
    }
  };

  const getFolderIcon = (category: string) => {
    switch (category) {
      case 'legal': return <Shield className="h-4 w-4 text-red-600" />;
      case 'profile': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'credentials': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'identity': return <Lock className="h-4 w-4 text-orange-600" />;
      default: return <Folder className="h-4 w-4 text-gray-600" />;
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    const folder = doc.folder_category || 'general';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(doc);
    return acc;
  }, {} as Record<string, UserDocument[]>);

  const filteredDocuments = activeFolder === 'all' 
    ? documents 
    : documents.filter(doc => doc.folder_category === activeFolder);

  const folderCounts = {
    all: documents.length,
    legal: groupedDocuments.legal?.length || 0,
    profile: groupedDocuments.profile?.length || 0,
    credentials: groupedDocuments.credentials?.length || 0,
    identity: groupedDocuments.identity?.length || 0,
    general: groupedDocuments.general?.length || 0,
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Documents
            </CardTitle>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="document-type">Document Type *</Label>
                    <Select value={selectedDocType} onValueChange={handleDocTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type.document_type} value={type.document_type}>
                            {type.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDocTypeConfig && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedDocTypeConfig.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="file-upload">File *</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, or PNG files up to 10MB
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="document-name">Document Name *</Label>
                    <Input
                      id="document-name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Enter document name"
                    />
                  </div>

                  {selectedDocTypeConfig?.requires_expiration && (
                    <div>
                      <Label htmlFor="expiration-date">Expiration Date</Label>
                      <Input
                        id="expiration-date"
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="visibility">Document Visibility</Label>
                    <Select value={selectedVisibility} onValueChange={(value: 'private' | 'public' | 'network_shared') => setSelectedVisibility(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Private - Only visible to you
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public - Visible to your network on request
                          </div>
                        </SelectItem>
                        <SelectItem value="network_shared">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Network Shared - Visible to connected vendors
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="folder">Folder Category</Label>
                    <Select value={selectedFolderCategory} onValueChange={(value: 'legal' | 'profile' | 'credentials' | 'identity' | 'general') => setSelectedFolderCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Legal Documents
                          </div>
                        </SelectItem>
                        <SelectItem value="profile">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Profile Documents
                          </div>
                        </SelectItem>
                        <SelectItem value="credentials">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Credentials & Certifications
                          </div>
                        </SelectItem>
                        <SelectItem value="identity">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Identity Documents
                          </div>
                        </SelectItem>
                        <SelectItem value="general">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            General Documents
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes about this document"
                      rows={3}
                    />
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                      disabled={uploading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || !selectedDocType || !documentName.trim() || uploading}
                      className="flex-1"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Storage Usage Display */}
          {storageInfo && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="font-medium">Storage Usage</span>
                  {storageInfo.subscription_tier === 'premium' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {storageInfo.storage_used_mb.toFixed(1)} MB / {storageInfo.storage_limit_mb} MB
                </div>
              </div>
              
              <Progress 
                value={(storageInfo.storage_used_mb / storageInfo.storage_limit_mb) * 100} 
                className="h-2 mb-2"
              />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {((storageInfo.storage_used_mb / storageInfo.storage_limit_mb) * 100).toFixed(1)}% used
                </span>
                {storageInfo.subscription_tier === 'standard' && (
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade to Premium (500MB)
                  </Button>
                )}
              </div>
              
              {storageInfo.storage_used_mb / storageInfo.storage_limit_mb > 0.9 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Storage nearly full. Consider upgrading or removing unused documents.
                </div>
              )}
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No documents uploaded yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload important documents like NDAs, insurance certificates, and certifications
              </p>
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <Tabs value={activeFolder} onValueChange={setActiveFolder} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  All ({folderCounts.all})
                </TabsTrigger>
                <TabsTrigger value="legal" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Legal ({folderCounts.legal})
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Profile ({folderCounts.profile})
                </TabsTrigger>
                <TabsTrigger value="credentials" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Credentials ({folderCounts.credentials})
                </TabsTrigger>
                <TabsTrigger value="identity" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Identity ({folderCounts.identity})
                </TabsTrigger>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  General ({folderCounts.general})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeFolder} className="mt-6">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No documents in this folder yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            {getFolderIcon(doc.folder_category)}
                            {getStatusIcon(doc.status, doc.verified_by)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{doc.document_name}</p>
                              {getVisibilityIcon(doc.visibility)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{doc.document_type.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>{format(new Date(doc.upload_date), "MMM d, yyyy")}</span>
                              {doc.expiration_date && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Expires {format(new Date(doc.expiration_date), "MMM d, yyyy")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getVisibilityBadge(doc.visibility)}
                          {getStatusBadge(doc.status, doc.verified_by)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {!doc.verified_by && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(doc)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDocuments;

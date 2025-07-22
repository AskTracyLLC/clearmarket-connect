import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LegalDocumentManager } from "./LegalDocumentManager";
import { 
  FileText, 
  Search, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Folder,
  Users,
  Lock,
  Globe,
  Crown
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
  user_display_name?: string;
}

export const DocumentManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select(`
          *,
          users!user_documents_user_id_fkey(display_name, anonymous_username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDocuments((data || []).map(doc => ({
        ...doc,
        upload_date: doc.upload_date || doc.created_at,
        status: doc.status as 'active' | 'expired' | 'revoked' | 'pending' || 'pending',
        visibility: doc.visibility as 'private' | 'public' | 'network_shared' || 'private',
        folder_category: doc.folder_category as 'legal' | 'profile' | 'credentials' | 'identity' | 'general' || 'general',
        user_display_name: doc.users?.display_name || doc.users?.anonymous_username || 'Unknown User'
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

  const handleVerifyDocument = async (docId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('user_documents')
        .update({
          status: approved ? 'active' : 'rejected',
          verified_by: approved ? 'admin' : null,
          verified_at: approved ? new Date().toISOString() : null,
          verification_notes: approved ? 'Approved by admin' : 'Rejected by admin'
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: approved ? "Document approved" : "Document rejected",
        description: `Document has been ${approved ? 'verified and approved' : 'rejected'}`
      });

      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Error updating document",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = folderFilter === 'all' || doc.folder_category === folderFilter;
    const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;
    
    return matchesSearch && matchesFolder && matchesVisibility;
  });

  const getStatusBadge = (status: string, verifiedBy?: string) => {
    if (status === 'active' && verifiedBy) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
    } else if (status === 'expired') {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const folderCounts = documents.reduce((acc, doc) => {
    const folder = doc.folder_category || 'general';
    acc[folder] = (acc[folder] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const docStats = [
    { label: "Total Documents", value: documents.length.toString(), trend: "+12%" },
    { label: "Pending Review", value: documents.filter(d => d.status === 'pending').length.toString(), trend: "-5%" },
    { label: "Verified", value: documents.filter(d => d.status === 'active' && d.verified_by).length.toString(), trend: "+8%" },
    { label: "Storage Used", value: `${(documents.reduce((sum, doc) => sum + doc.file_size, 0) / (1024 * 1024)).toFixed(1)} MB`, trend: "+15%" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Management System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">All Documents</TabsTrigger>
            <TabsTrigger value="verification">Verification Queue</TabsTrigger>
            <TabsTrigger value="legal">Legal Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {docStats.map((stat, index) => (
                  <Card key={index} className="p-4">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xs text-green-600">{stat.trend}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: "Document verified", user: "John Doe", time: "2 mins ago", type: "success" },
                      { action: "New document uploaded", user: "Jane Smith", time: "5 mins ago", type: "info" },
                      { action: "Document rejected", user: "Bob Johnson", time: "8 mins ago", type: "warning" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'success' ? 'bg-green-500' : 
                            activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">by {activity.user}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders ({documents.length})</SelectItem>
                    <SelectItem value="legal">Legal ({folderCounts.legal || 0})</SelectItem>
                    <SelectItem value="profile">Profile ({folderCounts.profile || 0})</SelectItem>
                    <SelectItem value="credentials">Credentials ({folderCounts.credentials || 0})</SelectItem>
                    <SelectItem value="identity">Identity ({folderCounts.identity || 0})</SelectItem>
                    <SelectItem value="general">General ({folderCounts.general || 0})</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visibility</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="network_shared">Network Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents found</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          {getFolderIcon(doc.folder_category)}
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{doc.document_name}</h4>
                            {getVisibilityIcon(doc.visibility)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_type.replace('_', ' ')} • {doc.user_display_name} • 
                            {doc.upload_date && format(new Date(doc.upload_date), "MMM d, yyyy")} • 
                            {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getVisibilityBadge(doc.visibility)}
                        {getStatusBadge(doc.status, doc.verified_by)}
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900">Documents Awaiting Verification</h4>
                <p className="text-sm text-blue-800">Review and approve user-submitted documents</p>
              </div>

              <div className="space-y-3">
                {documents.filter(doc => doc.status === 'pending').map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getFolderIcon(doc.folder_category)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{doc.document_name}</h4>
                            {getVisibilityIcon(doc.visibility)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_type.replace('_', ' ')} from {doc.user_display_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVisibilityBadge(doc.visibility)}
                        {getStatusBadge(doc.status, doc.verified_by)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerifyDocument(doc.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleVerifyDocument(doc.id, false)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {documents.filter(doc => doc.status === 'pending').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents pending verification</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <LegalDocumentManager />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Background Check Required</h4>
                      <p className="text-sm text-muted-foreground">Field representatives must upload background checks</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Insurance Certificate Required</h4>
                      <p className="text-sm text-muted-foreground">Professional liability insurance verification</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Maximum File Size</h4>
                      <p className="text-sm text-muted-foreground">5 MB per document upload</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Document Encryption</h4>
                      <p className="text-sm text-muted-foreground">All documents encrypted at rest</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Access Logging</h4>
                      <p className="text-sm text-muted-foreground">Track all document access and downloads</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
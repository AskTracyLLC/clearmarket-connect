import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  Star, 
  MoreHorizontal, 
  Send, 
  NotebookPen,
  Search,
  Eye,
  UserPlus,
  UserMinus,
  Loader2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import { useUserProfile } from '@/hooks/useUserProfile';
import TrustScoreReviewModal from '@/components/TrustScore/TrustScoreReviewModal';
import UserCommentModal from '@/components/ui/UserCommentModal';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useNetworkConnections } from '@/hooks/useNetworkConnections';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { InviteModal } from '@/components/InviteModal';
import { useNavigate } from 'react-router-dom';

const NetworkPage = () => {
  const { profile } = useUserProfile();
  const { sendMessage } = useDirectMessages();
  const { connections, isLoading, removeConnection } = useNetworkConnections();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredConnections = connections.filter(connection => {
    const name = connection.display_name || connection.anonymous_username;
    const location = connection.location || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || location.includes(locationFilter);
    const matchesRating = ratingFilter === 'all' || (connection.trust_score || 0) >= parseFloat(ratingFilter);
    
    return matchesSearch && matchesLocation && matchesRating;
  });

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'unlocked':
        return 'default';
      case 'referral':
        return 'secondary';
      case 'invitation':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatMethod = (method: string) => {
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  const handleOpenReview = (user: any) => {
    setSelectedUser({
      id: user.user_id,
      display_name: user.display_name || user.anonymous_username,
      role: user.role
    });
    setReviewModalOpen(true);
  };

  const handleOpenComment = (user: any) => {
    setSelectedUser({
      id: user.user_id,
      name: user.display_name || user.anonymous_username,
      initials: (user.display_name || user.anonymous_username).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      role: user.role
    });
    setCommentModalOpen(true);
  };

  const handleOpenMessage = (user: any) => {
    setSelectedUser(user);
    setMessageModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedUser) return;

    const success = await sendMessage(selectedUser.user_id, messageContent);
    if (success) {
      toast.success('Message sent successfully');
      setMessageContent('');
      setMessageModalOpen(false);
    } else {
      toast.error('Failed to send message');
    }
  };

  const handleRemoveConnection = async () => {
    if (!selectedUser) return;

    const success = await removeConnection(selectedUser.user_id);
    if (success) {
      toast.success('Connection removed successfully');
      setRemoveDialogOpen(false);
      setSelectedUser(null);
    } else {
      toast.error('Failed to remove connection');
    }
  };

  const handleViewProfile = (connection: any) => {
    if (connection.role === 'field_rep') {
      navigate(`/field-rep/${connection.user_id}`);
    } else {
      navigate(`/vendor/${connection.user_id}`);
    }
  };

  const networkTitle = profile?.role === 'vendor' ? 'My Field Reps' : 'My Vendors';
  const connectionType = profile?.role === 'vendor' ? 'Field Reps' : 'Vendors';

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your network...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{networkTitle}</h1>
          <p className="text-muted-foreground">
            Manage your professional network and connections
          </p>
          <Button 
            onClick={() => setInviteModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite to Network
          </Button>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{connections.length}</p>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {connections.length > 0 
                      ? (connections.reduce((sum, conn) => sum + (conn.trust_score || 0), 0) / connections.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Trust Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {connections.filter(conn => conn.connection_method === 'unlocked').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Credit Unlocks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {connections.filter(conn => conn.connection_method === 'referral').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="80">80+ Trust Score</SelectItem>
                  <SelectItem value="70">70+ Trust Score</SelectItem>
                  <SelectItem value="60">60+ Trust Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Network Directory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Network Directory ({filteredConnections.length} {connectionType.toLowerCase()})
            </CardTitle>
            <CardDescription>
              Your professional network of {connectionType.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConnections.map((connection) => {
                const name = connection.display_name || connection.anonymous_username;
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                
                return (
                <Card key={connection.id} className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{name}</h3>
                            {connection.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {connection.location}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Connected: {new Date(connection.connected_date).toLocaleDateString()}
                            </div>
                            {connection.trust_score && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                Trust Score: {connection.trust_score}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Badge variant={getMethodBadgeVariant(connection.connection_method)}>
                          {formatMethod(connection.connection_method)}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(connection)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenComment(connection)}>
                              <NotebookPen className="h-4 w-4 mr-2" />
                              Private Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenMessage(connection)}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenReview(connection)}>
                              <Star className="h-4 w-4 mr-2" />
                              Leave Review
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(connection);
                                setRemoveDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Connection
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-muted">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last active: {connection.last_active ? new Date(connection.last_active).toLocaleDateString() : 'Never'}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenMessage(connection)}>
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenReview(connection)}>
                            <Star className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
            
            {filteredConnections.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || locationFilter !== 'all' || ratingFilter !== 'all' 
                    ? 'No connections match your filters' 
                    : `No ${connectionType} Connected`
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || locationFilter !== 'all' || ratingFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : `Start building your network by searching for ${connectionType.toLowerCase()}`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedUser && (
          <TrustScoreReviewModal 
            open={reviewModalOpen}
            onOpenChange={setReviewModalOpen}
            targetUser={selectedUser}
            onReviewSubmitted={() => {
              setReviewModalOpen(false);
              toast.success('Review submitted successfully');
            }}
          />
        )}

        <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Send a message to {selectedUser?.display_name || selectedUser?.anonymous_username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea 
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setMessageModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <InviteModal 
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
        />

        <UserCommentModal
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          targetUser={selectedUser}
        />

        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Connection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {selectedUser?.display_name || selectedUser?.anonymous_username} from your network? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveConnection} className="bg-destructive hover:bg-destructive/90">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default NetworkPage;

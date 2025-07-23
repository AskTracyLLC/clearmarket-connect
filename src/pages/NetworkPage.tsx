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
  Filter,
  Eye,
  UserPlus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useUserProfile } from '@/hooks/useUserProfile';
import TrustScoreReviewModal from '@/components/TrustScore/TrustScoreReviewModal';
import UserCommentModal from '@/components/ui/UserCommentModal';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { InviteModal } from '@/components/InviteModal';

const NetworkPage = () => {
  const { profile } = useUserProfile();
  const { sendMessage } = useDirectMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock network data - in real app this would come from API based on user role
  const networkConnections = profile?.role === 'vendor' ? [
    {
      id: 'rep-1',
      initials: "J.D.",
      name: "John Davis",
      location: "Los Angeles, CA",
      platforms: ["CoreLogic", "Clear Capital"],
      connectedDate: "2024-01-15",
      method: "Unlocked",
      lastActive: "2 days ago",
      rating: 4.8,
      completedJobs: 145,
      trustScore: 87,
      role: 'field_rep'
    },
    {
      id: 'rep-2',
      initials: "S.M.",
      name: "Sarah Miller",
      location: "Dallas, TX",
      platforms: ["ServiceLink", "AMC"],
      connectedDate: "2024-02-08",
      method: "Referral",
      lastActive: "1 week ago",
      rating: 4.9,
      completedJobs: 89,
      trustScore: 92,
      role: 'field_rep'
    },
    {
      id: 'rep-3',
      initials: "R.W.",
      name: "Robert Wilson",
      location: "Miami, FL",
      platforms: ["Clear Capital", "Solidifi"],
      connectedDate: "2024-01-22",
      method: "Unlocked",
      lastActive: "Yesterday",
      rating: 4.7,
      completedJobs: 234,
      trustScore: 84,
      role: 'field_rep'
    }
  ] : [
    {
      id: 'vendor-1',
      initials: "A.R.",
      name: "Atlantic Real Estate",
      location: "New York, NY",
      platforms: ["CoreLogic", "Clear Capital", "ServiceLink"],
      connectedDate: "2024-01-10",
      method: "Unlocked",
      lastActive: "Today",
      rating: 4.6,
      completedJobs: 89,
      trustScore: 78,
      role: 'vendor'
    },
    {
      id: 'vendor-2',
      initials: "S.P.",
      name: "Sunset Properties",
      location: "San Diego, CA",
      platforms: ["AMC", "Solidifi"],
      connectedDate: "2024-02-15",
      method: "Referral",
      lastActive: "2 hours ago",
      rating: 4.8,
      completedJobs: 156,
      trustScore: 85,
      role: 'vendor'
    }
  ];

  const filteredConnections = networkConnections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || connection.location.includes(locationFilter);
    const matchesRating = ratingFilter === 'all' || connection.rating >= parseFloat(ratingFilter);
    
    return matchesSearch && matchesLocation && matchesRating;
  });

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'Unlocked':
        return 'default';
      case 'Referral':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleOpenReview = (user: any) => {
    setSelectedUser(user);
    setReviewModalOpen(true);
  };

  const handleOpenComment = (user: any) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      initials: user.initials,
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

    const success = await sendMessage(selectedUser.id, messageContent);
    if (success) {
      toast.success('Message sent successfully');
      setMessageContent('');
      setMessageModalOpen(false);
    } else {
      toast.error('Failed to send message');
    }
  };

  const networkTitle = profile?.role === 'vendor' ? 'My Field Reps' : 'My Vendors';
  const connectionType = profile?.role === 'vendor' ? 'Field Reps' : 'Vendors';

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
                  <p className="text-2xl font-bold text-foreground">{networkConnections.length}</p>
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
                    {networkConnections.length > 0 
                      ? (networkConnections.reduce((sum, conn) => sum + conn.rating, 0) / networkConnections.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Rating Received</p>
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
                    {networkConnections.filter(conn => conn.method === 'Unlocked').length}
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
                    {networkConnections.filter(conn => conn.method === 'Referral').length}
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
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
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
              {filteredConnections.map((connection) => (
                <Card key={connection.id} className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {connection.initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{connection.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {connection.location}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {connection.platforms.slice(0, 3).map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                            {connection.platforms.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{connection.platforms.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Connected: {new Date(connection.connectedDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              {connection.rating} ({connection.completedJobs} jobs)
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Trust Score: {connection.trustScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Badge variant={getMethodBadgeVariant(connection.method)}>
                          {connection.method}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-muted">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last active: {connection.lastActive}</span>
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
              ))}
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
                    : `Start building your network by searching for ${connectionType.toLowerCase()}.`
                  }
                </p>
                {(!searchTerm && locationFilter === 'all' && ratingFilter === 'all') && (
                  <Button>
                    Find {connectionType}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {selectedUser && (
          <TrustScoreReviewModal
            open={reviewModalOpen}
            onOpenChange={setReviewModalOpen}
            targetUser={{
              id: selectedUser.id,
              display_name: selectedUser.name,
              role: selectedUser.role as 'field_rep' | 'vendor'
            }}
            onReviewSubmitted={() => {
              toast.success('Review submitted successfully');
              setReviewModalOpen(false);
            }}
          />
        )}
        
        <UserCommentModal
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          targetUser={selectedUser}
        />

        {/* Message Modal */}
        <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Send a message to {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessageModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invite Modal */}
        <InviteModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          onInviteSent={() => {
            toast.success('Invitation sent successfully!');
            setInviteModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

export default NetworkPage;
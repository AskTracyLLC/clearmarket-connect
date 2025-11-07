import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  MessageSquare, 
  UserX, 
  Send, 
  Calendar,
  MapPin,
  Star,
  MessageCircle,
  X,
  CheckCheck,
  NotebookPen,
  BarChart3,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import UserCommentModal from "@/components/ui/UserCommentModal";
import CoverageRequestAnalytics from "./CoverageRequestAnalytics";

interface CoverageRequest {
  id: string;
  title: string;
  details?: string;
  description?: string;
  location?: string;
  selected_state?: string;
  selected_county?: string;
  budget?: string;
  budget_range?: string;
  status: string;
  postedDate?: string;
  created_at?: string;
  expiresDate?: string;
  expires_at?: string;
  views?: number;
  view_count?: number;
  responses?: number;
  response_count?: number;
  inspectionTypes?: string[];
  platforms?: string[];
}

interface InterestedRep {
  id: string;
  name: string;
  email?: string;
  trustScore: number;
  experience: string;
  distance: string;
  responseTime: string;
  lastMessageDate?: string;
  isBoostActive: boolean;
  hasPrivateProfile: boolean;
  responseStatus?: string;
  respondedAt?: string;
}

interface PassedRep extends InterestedRep {
  passReason: string;
  passedAt: string;
}

interface CoverageRequestDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CoverageRequest | null;
}

const passReasons = [
  "Too far from coverage area",
  "Not qualified for requirements", 
  "No response to messages",
  "Pricing not competitive",
  "Poor communication",
  "Other"
];

const CoverageRequestDetailModal = ({ open, onOpenChange, request }: CoverageRequestDetailModalProps) => {
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [individualMessage, setIndividualMessage] = useState("");
  const [selectedRepForMessage, setSelectedRepForMessage] = useState<string | null>(null);
  const [passReason, setPassReason] = useState("");
  const [customPassReason, setCustomPassReason] = useState("");
  const [selectedRepForPass, setSelectedRepForPass] = useState<string | null>(null);
  const [repComments, setRepComments] = useState<Record<string, string>>({});
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedCommentUser, setSelectedCommentUser] = useState<{id: string; name: string; initials?: string} | null>(null);
  const [interestedReps, setInterestedReps] = useState<InterestedRep[]>([]);
  const [passedReps, setPassedReps] = useState<PassedRep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open && request?.id) {
      fetchResponseData();
    }
  }, [open, request?.id]);

  const fetchResponseData = async () => {
    if (!request?.id) return;
    
    try {
      setLoading(true);

      // Fetch interested reps
      const { data: responsesData, error: responsesError } = await supabase
        .from('coverage_request_responses')
        .select(`
          id,
          field_rep_id,
          created_at,
          status
        `)
        .eq('request_id', request.id);

      if (responsesError) throw responsesError;

      // Fetch passed reps
      const { data: passesData, error: passesError } = await supabase
        .from('coverage_request_passes')
        .select(`
          id,
          field_rep_id,
          pass_reason,
          created_at
        `)
        .eq('request_id', request.id);

      if (passesError) throw passesError;

      // Get all field rep IDs
      const interestedRepIds = responsesData?.map(r => r.field_rep_id) || [];
      const passedRepIds = passesData?.map(p => p.field_rep_id) || [];
      const allRepIds = [...interestedRepIds, ...passedRepIds];

      if (allRepIds.length === 0) {
        setInterestedReps([]);
        setPassedReps([]);
        setLoading(false);
        return;
      }

      // Fetch field rep profiles for all interested reps
      const { data: fieldRepData, error: fieldRepError } = await supabase
        .from('field_rep_profiles')
        .select('id, first_name, last_name, city, state, anonymous_username, bio')
        .in('id', allRepIds);

      if (fieldRepError) throw fieldRepError;

      // Fetch trust scores
      const { data: trustScoresData } = await supabase
        .from('trust_scores')
        .select('user_id, overall_trust_score')
        .in('user_id', allRepIds);

      // Create profile map
      const profileMap = new Map(fieldRepData?.map(p => [p.id, p]));
      const trustScoreMap = new Map(trustScoresData?.map(t => [
        t.user_id, 
        Math.round(t.overall_trust_score || 0)
      ]));

      // Process interested reps
      const interested: InterestedRep[] = responsesData?.map(response => {
        const profile = profileMap.get(response.field_rep_id);
        const trustScore = trustScoreMap.get(response.field_rep_id) || 0;
        const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
        
        return {
          id: response.field_rep_id,
          name: fullName || profile?.anonymous_username || 'Unknown',
          trustScore: trustScore,
          experience: 'Not specified',
          distance: profile?.city ? `${profile.city}, ${profile.state}` : 'N/A',
          responseTime: 'N/A', // TODO: Get from response tracking
          isBoostActive: false, // TODO: Check boost status
          hasPrivateProfile: false, // TODO: Determine from profile settings
          responseStatus: response.status,
          respondedAt: response.created_at
        };
      }) || [];

      // Process passed reps
      const passed: PassedRep[] = passesData?.map(pass => {
        const profile = profileMap.get(pass.field_rep_id);
        const trustScore = trustScoreMap.get(pass.field_rep_id) || 0;
        const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
        
        return {
          id: pass.field_rep_id,
          name: fullName || profile?.anonymous_username || 'Unknown',
          trustScore: trustScore,
          experience: 'Not specified',
          distance: profile?.city ? `${profile.city}, ${profile.state}` : 'N/A',
          responseTime: 'N/A',
          isBoostActive: false,
          hasPrivateProfile: false,
          passReason: pass.pass_reason,
          passedAt: pass.created_at
        };
      }) || [];

      setInterestedReps(interested);
      setPassedReps(passed);

    } catch (error: any) {
      console.error('Error fetching response data:', error);
      toast({
        title: "Error",
        description: "Failed to load response data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  const handleSelectRep = (repId: string, checked: boolean) => {
    if (checked) {
      setSelectedReps(prev => [...prev, repId]);
    } else {
      setSelectedReps(prev => prev.filter(id => id !== repId));
    }
  };

  const handleSendBulkMessage = () => {
    if (selectedReps.length === 0 || !bulkMessage.trim()) return;
    
    // TODO: Implement bulk message sending
    console.log("Sending bulk message to:", selectedReps, "Message:", bulkMessage);
    setBulkMessage("");
    setSelectedReps([]);
  };

  const handleSendIndividualMessage = (repId: string) => {
    if (!individualMessage.trim()) return;
    
    // TODO: Implement individual message sending
    console.log("Sending message to:", repId, "Message:", individualMessage);
    setIndividualMessage("");
    setSelectedRepForMessage(null);
  };

  const handlePassRep = async (repId: string) => {
    const finalReason = passReason === "Other" ? customPassReason : passReason;
    if (!finalReason.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('coverage_request_passes')
        .insert({
          request_id: request!.id,
          field_rep_id: repId,
          vendor_id: user.id,
          pass_reason: finalReason
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field rep has been passed",
      });

      setPassReason("");
      setCustomPassReason("");
      setSelectedRepForPass(null);
      fetchResponseData(); // Refresh data
    } catch (error: any) {
      console.error('Error passing rep:', error);
      toast({
        title: "Error",
        description: "Failed to pass field rep",
        variant: "destructive",
      });
    }
  };

  const handleUpdateComment = (targetUserId: string, comment: string) => {
    setRepComments(prev => ({ ...prev, [targetUserId]: comment }));
    // TODO: Implement comment saving using new user_comments table
    console.log("Updating comment for user:", targetUserId, "Comment:", comment);
  };

  const handleOpenComment = (rep: InterestedRep) => {
    setSelectedCommentUser({
      id: rep.id,
      name: rep.name,
      initials: rep.name.split(' ').map(n => n[0]).join('')
    });
    setCommentModalOpen(true);
  };

  const RepCard = ({ rep, showPassOption = true }: { rep: InterestedRep; showPassOption?: boolean }) => (
    <Card key={rep.id} className="border border-muted">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Rep Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {showPassOption && (
                <Checkbox
                  checked={selectedReps.includes(rep.id)}
                  onCheckedChange={(checked) => handleSelectRep(rep.id, checked as boolean)}
                />
              )}
              <Avatar>
                <AvatarFallback>{rep.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{rep.name}</h3>
                  {rep.isBoostActive && <Badge variant="default" className="text-xs">BOOST</Badge>}
                  {rep.hasPrivateProfile && <Badge variant="secondary" className="text-xs">PRIVATE</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  {rep.trustScore}/100 • {rep.experience} • {rep.distance}
                </div>
              </div>
            </div>
          </div>

          {/* Rep Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Response Time:</span>
              <div className="font-medium">{rep.responseTime}</div>
            </div>
            {rep.lastMessageDate && (
              <div>
                <span className="text-muted-foreground">Last Reply:</span>
                <div className="font-medium">{new Date(rep.lastMessageDate).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          {/* Private Notes Button */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Private Notes:</label>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => handleOpenComment(rep)}
              className="text-muted-foreground hover:text-foreground"
            >
              <NotebookPen className="h-4 w-4 mr-1" />
              Notes
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRepForMessage(rep.id)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </Button>
            
            {rep.lastMessageDate && (
              <Button variant="outline" size="sm">
                <MessageCircle className="h-3 w-3 mr-1" />
                View Chat
              </Button>
            )}
            
            {showPassOption && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRepForPass(rep.id)}
                className="text-destructive hover:text-destructive"
              >
                <UserX className="h-3 w-3 mr-1" />
                Pass
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{request.title}</DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {request.location || request.selected_state}
              {request.selected_county && ` - ${request.selected_county}`}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Posted: {new Date(request.postedDate || request.created_at || '').toLocaleDateString()}
            </div>
            <Badge variant={request.status === 'active' ? 'default' : 'secondary'}>
              {request.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="analytics" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="interested" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Interested ({interestedReps.length})
            </TabsTrigger>
            <TabsTrigger value="passed" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Passed ({passedReps.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <CoverageRequestAnalytics requestId={request.id} />
          </TabsContent>

          <TabsContent value="interested" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                {selectedReps.length > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedReps.length} rep(s) selected</span>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReps([])}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Send a message to selected reps..."
                          value={bulkMessage}
                          onChange={(e) => setBulkMessage(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button onClick={handleSendBulkMessage} disabled={!bulkMessage.trim()}>
                          <Send className="h-3 w-3 mr-2" />
                          Send Bulk Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Interested Reps List */}
                {interestedReps.length > 0 ? (
                  <div className="space-y-4">
                    {interestedReps.map(rep => (
                      <RepCard key={rep.id} rep={rep} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Responses Yet</h3>
                    <p className="text-muted-foreground">
                      Field reps who express interest will appear here
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="passed" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Reps that have been passed for this request. They won't be notified and can be reviewed for future opportunities.
                </div>
                {passedReps.length > 0 ? (
                  <div className="space-y-4">
                    {passedReps.map(rep => (
                      <Card key={rep.id} className="border border-muted">
                        <CardContent className="p-4">
                          <RepCard rep={rep} showPassOption={false} />
                          <div className="mt-4 pt-4 border-t border-muted">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Reason: </span>
                              <span className="font-medium">{rep.passReason}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Passed on {new Date(rep.passedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <UserX className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Passed Reps</h3>
                    <p className="text-muted-foreground">
                      Reps you pass on will appear here for future reference
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Message history will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Individual Message Modal */}
        {selectedRepForMessage && (
          <Dialog open={!!selectedRepForMessage} onOpenChange={() => setSelectedRepForMessage(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Sending to: {interestedReps.find(r => r.id === selectedRepForMessage)?.name}
                </div>
                <Textarea
                  placeholder="Type your message..."
                  value={individualMessage}
                  onChange={(e) => setIndividualMessage(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRepForMessage(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSendIndividualMessage(selectedRepForMessage)}>
                    <Send className="h-3 w-3 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Pass Rep Modal */}
        {selectedRepForPass && (
          <Dialog open={!!selectedRepForPass} onOpenChange={() => setSelectedRepForPass(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pass Rep</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Passing: {interestedReps.find(r => r.id === selectedRepForPass)?.name}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for passing:</label>
                  <Select value={passReason} onValueChange={setPassReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {passReasons.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {passReason === "Other" && (
                  <Textarea
                    placeholder="Please specify the reason..."
                    value={customPassReason}
                    onChange={(e) => setCustomPassReason(e.target.value)}
                  />
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRepForPass(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handlePassRep(selectedRepForPass)}
                    disabled={!passReason || (passReason === "Other" && !customPassReason.trim())}
                  >
                    <UserX className="h-3 w-3 mr-2" />
                    Pass Rep
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* User Comment Modal */}
        <UserCommentModal
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          targetUser={selectedCommentUser}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CoverageRequestDetailModal;
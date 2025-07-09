import { useState } from "react";
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
  CheckCheck
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CoverageRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: string;
  status: string;
  postedDate: string;
  expiresDate: string;
  views: number;
  responses: number;
  inspectionTypes: string[];
  platforms: string[];
}

interface InterestedRep {
  id: string;
  name: string;
  trustScore: number;
  experience: string;
  distance: string;
  responseTime: string;
  lastMessageDate?: string;
  isBoostActive: boolean;
  hasPrivateProfile: boolean;
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

const mockInterestedReps: InterestedRep[] = [
  {
    id: "1",
    name: "John Smith",
    trustScore: 95,
    experience: "5+ years",
    distance: "2.5 miles",
    responseTime: "2 hours",
    lastMessageDate: "2024-03-10",
    isBoostActive: true,
    hasPrivateProfile: false
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    trustScore: 88,
    experience: "3+ years",
    distance: "8.2 miles",
    responseTime: "4 hours",
    isBoostActive: false,
    hasPrivateProfile: true
  },
  {
    id: "3",
    name: "Mike Davis", 
    trustScore: 92,
    experience: "7+ years",
    distance: "5.1 miles",
    responseTime: "1 hour",
    lastMessageDate: "2024-03-08",
    isBoostActive: true,
    hasPrivateProfile: false
  }
];

const mockPassedReps: InterestedRep[] = [
  {
    id: "4",
    name: "Tom Wilson",
    trustScore: 75,
    experience: "2+ years", 
    distance: "15.3 miles",
    responseTime: "24 hours",
    isBoostActive: false,
    hasPrivateProfile: false
  }
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

  const handlePassRep = (repId: string) => {
    const finalReason = passReason === "Other" ? customPassReason : passReason;
    if (!finalReason.trim()) return;
    
    // TODO: Implement pass rep functionality
    console.log("Passing rep:", repId, "Reason:", finalReason);
    setPassReason("");
    setCustomPassReason("");
    setSelectedRepForPass(null);
  };

  const handleUpdateComment = (repId: string, comment: string) => {
    setRepComments(prev => ({ ...prev, [repId]: comment }));
    // TODO: Implement comment saving
    console.log("Updating comment for rep:", repId, "Comment:", comment);
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

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Private Notes:</label>
            <Textarea
              placeholder="Add private notes about this rep..."
              value={repComments[rep.id] || ""}
              onChange={(e) => handleUpdateComment(rep.id, e.target.value)}
              className="min-h-[60px]"
            />
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
              {request.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Posted: {new Date(request.postedDate).toLocaleDateString()}
            </div>
            <Badge variant={request.status === 'active' ? 'default' : 'secondary'}>
              {request.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="interested" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interested" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Interested ({mockInterestedReps.length})
            </TabsTrigger>
            <TabsTrigger value="passed" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Passed ({mockPassedReps.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interested" className="space-y-6">
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
            <div className="space-y-4">
              {mockInterestedReps.map(rep => (
                <RepCard key={rep.id} rep={rep} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="passed" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Reps that have been passed for this request. They won't be notified and can be reviewed for future opportunities.
            </div>
            {mockPassedReps.map(rep => (
              <RepCard key={rep.id} rep={rep} showPassOption={false} />
            ))}
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
                  Sending to: {mockInterestedReps.find(r => r.id === selectedRepForMessage)?.name}
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
                  Passing: {mockInterestedReps.find(r => r.id === selectedRepForPass)?.name}
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
      </DialogContent>
    </Dialog>
  );
};

export default CoverageRequestDetailModal;
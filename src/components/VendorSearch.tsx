import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Lock, ArrowLeft, Copy, Star, Users, Clock } from "lucide-react";
import { differenceInDays, addDays, format } from "date-fns";

// Mock search results data
const mockResults = [
  {
    id: 1,
    initials: "T.M.",
    distance: "4.2 mi away",
    systems: ["EZ", "IA"],
    inspectionTypes: ["Interior/Exterior", "Drive-by"],
    pricing: "$25-35"
  },
  {
    id: 2,
    initials: "J.D.",
    distance: "7.8 mi away",
    systems: ["IA", "SG"],
    inspectionTypes: ["Exterior Only", "Occupancy Check"],
    pricing: "$30-40"
  },
  {
    id: 3,
    initials: "M.R.",
    distance: "12.1 mi away",
    systems: ["EZ", "IA", "SG"],
    inspectionTypes: ["Interior/Exterior", "REO Trash Out"],
    pricing: "$45-55"
  }
];

// Mock connections for review with 30-day restriction logic
const mockConnections = [
  {
    id: 1,
    initials: "T.M.",
    name: "Tom Martinez",
    lastWorked: "2 weeks ago",
    projects: 3,
    lastReviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  {
    id: 2,
    initials: "S.K.",
    name: "Sarah Kim", 
    lastWorked: "1 month ago",
    projects: 5,
    lastReviewDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
  },
  {
    id: 3,
    initials: "M.J.",
    name: "Mike Johnson",
    lastWorked: "3 weeks ago", 
    projects: 7,
    lastReviewDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) // 29 days ago
  }
].map(connection => {
  const daysSinceReview = differenceInDays(new Date(), connection.lastReviewDate);
  const canReview = daysSinceReview >= 30;
  const nextReviewDate = addDays(connection.lastReviewDate, 30);
  const daysUntilNextReview = canReview ? 0 : 30 - daysSinceReview;
  
  return {
    ...connection,
    canReview,
    daysSinceReview,
    nextReviewDate,
    daysUntilNextReview
  };
});

const VendorSearch = () => {
  const [zipCode, setZipCode] = useState("");
  const [systemFilter, setSystemFilter] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [modalView, setModalView] = useState<"main" | "earn-credits" | "review-connections" | "referral-code">("main");

  const handleSearch = () => {
    if (zipCode.trim()) {
      setSearchPerformed(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Find Field Reps in Your Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="zipCode">Search by Zip Code</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter zip code (e.g., 90210)"
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} variant="hero" className="px-8">
              Search
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="system-filter" className="text-base font-medium">
                Filter by System Familiarity
              </Label>
              <p className="text-sm text-muted-foreground">
                Show only reps familiar with your preferred platforms
              </p>
            </div>
            <Switch 
              id="system-filter" 
              checked={systemFilter}
              onCheckedChange={setSystemFilter}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchPerformed && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Search Results for {zipCode}
          </h2>
          
          <div className="space-y-4">
            {mockResults.map((rep) => (
              <Card key={rep.id} className="hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      {/* Rep Info Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{rep.initials}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{rep.initials}</h3>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <MapPin className="h-3 w-3" />
                              <span>{rep.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Systems */}
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Systems:</Label>
                        <div className="flex gap-2">
                          {rep.systems.map((system) => (
                            <Badge key={system} variant="secondary">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Inspection Types */}
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Inspection Types:</Label>
                        <div className="flex flex-wrap gap-2">
                          {rep.inspectionTypes.map((type) => (
                            <Badge key={type} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Pricing:</Label>
                        <span className="text-sm font-medium text-foreground">{rep.pricing}</span>
                      </div>
                    </div>

                    {/* Unlock Contact Button */}
                    <div className="flex flex-col items-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline-primary" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Unlock Contact
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          {modalView === "main" && (
                            <>
                              <DialogHeader>
                                <DialogTitle>Unlock Contact Information</DialogTitle>
                                <DialogDescription>
                                  Get access to {rep.initials}'s contact details
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="text-center text-foreground">
                                    <span className="font-semibold">Unlock contact for 3 credits</span>
                                  </p>
                                  <p className="text-center text-muted-foreground text-sm mt-1">
                                    Not enough credits? Earn by reviews, referrals, or purchase more.
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => setModalView("earn-credits")}
                                  >
                                    Earn Credits
                                  </Button>
                                  <Button variant="hero" className="w-full">
                                    Purchase Credits
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {modalView === "earn-credits" && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => setModalView("main")}
                                  >
                                    <ArrowLeft className="h-4 w-4" />
                                  </Button>
                                  Earn Credits
                                </DialogTitle>
                                <DialogDescription>
                                  Choose how you'd like to earn credits
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                  <Button 
                                    variant="outline" 
                                    className="w-full p-4 h-auto flex-col gap-2"
                                    onClick={() => setModalView("review-connections")}
                                  >
                                    <Star className="h-5 w-5" />
                                    <div className="text-center">
                                      <div className="font-medium">Review Connections</div>
                                      <div className="text-xs text-muted-foreground">Rate Field Reps you've worked with</div>
                                      <div className="text-xs text-primary font-medium">+1 credit per review</div>
                                    </div>
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    className="w-full p-4 h-auto flex-col gap-2"
                                    onClick={() => setModalView("referral-code")}
                                  >
                                    <Users className="h-5 w-5" />
                                    <div className="text-center">
                                      <div className="font-medium">Share Referral Code</div>
                                      <div className="text-xs text-muted-foreground">Invite new users to the platform</div>
                                      <div className="text-xs text-primary font-medium">+2 credits per successful referral</div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {modalView === "review-connections" && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => setModalView("earn-credits")}
                                  >
                                    <ArrowLeft className="h-4 w-4" />
                                  </Button>
                                  Review Connections
                                </DialogTitle>
                                <DialogDescription>
                                  Rate Field Reps you've previously worked with
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                 {mockConnections.map((connection) => (
                                   <div key={connection.id} className={`p-3 border rounded-lg ${
                                     connection.canReview ? 'border-border' : 'border-muted bg-muted/30'
                                   }`}>
                                     <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                           <span className="font-semibold text-primary text-sm">{connection.initials}</span>
                                         </div>
                                         <div className="flex-1">
                                           <div className="font-medium text-sm">{connection.name}</div>
                                           <div className="text-xs text-muted-foreground">
                                             {connection.projects} projects • {connection.lastWorked}
                                           </div>
                                           {!connection.canReview && (
                                             <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                               <Clock className="h-3 w-3" />
                                               <span>Available in {connection.daysUntilNextReview} day{connection.daysUntilNextReview !== 1 ? 's' : ''}</span>
                                             </div>
                                           )}
                                         </div>
                                       </div>
                                       <div className="flex flex-col items-end gap-1">
                                         <Button 
                                           size="sm" 
                                           variant={connection.canReview ? "outline" : "outline"}
                                           disabled={!connection.canReview}
                                         >
                                           {connection.canReview ? "Rate & Earn" : "Reviewed Recently"}
                                         </Button>
                                         {!connection.canReview && (
                                           <div className="text-xs text-muted-foreground">
                                             {format(connection.nextReviewDate, 'MMM d')}
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 ))}
                                
                                {mockConnections.length === 0 && (
                                  <div className="text-center py-6 text-muted-foreground">
                                    <p>No connections to review yet.</p>
                                    <p className="text-sm">Work with Field Reps to unlock review opportunities.</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {modalView === "referral-code" && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => setModalView("earn-credits")}
                                  >
                                    <ArrowLeft className="h-4 w-4" />
                                  </Button>
                                  Share Referral Code
                                </DialogTitle>
                                <DialogDescription>
                                  Invite new users and earn credits
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                  <Label className="text-sm font-medium">Your Referral Code</Label>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 p-2 bg-background border rounded text-center font-mono">
                                      VENDOR-ABC123
                                    </div>
                                    <Button size="icon" variant="outline">
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="font-medium">How it works:</div>
                                  <ul className="space-y-1 text-muted-foreground text-xs">
                                    <li>• Share your code with new users</li>
                                    <li>• They sign up and complete profile setup</li>
                                    <li>• Once they make their first connection, you earn 2 credits</li>
                                  </ul>
                                </div>
                                
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                  <div className="text-xs text-orange-800">
                                    <strong>Important:</strong> Credits are awarded only after successful verification. 
                                    Fake accounts will not generate credits.
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <div className="text-xs text-muted-foreground text-center">
                        3 credits required
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchPerformed && mockResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No field reps found in this area.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try expanding your search radius or check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorSearch;
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, DollarSign, Calendar, MessageSquare, Building } from "lucide-react";

interface SearchFilters {
  zipCode: string;
  coverageAreas: string[];
  workTypes: string[];
  platforms: string[];
  minimumPayment: string;
  monthlyVolume: string;
  sortBy: string;
}

interface FieldRepSearchResultsProps {
  filters: SearchFilters;
}

// Mock data for demonstration
const mockVendors = [
  {
    id: "1",
    companyName: "Premier Property Solutions",
    location: "Dallas, TX",
    distance: "5 miles",
    monthlyVolume: "50-75 orders",
    paymentRange: "$75-100",
    workTypes: ["Residential Inspections", "FHA Inspections"],
    platforms: ["Clear Capital", "ServiceLink"],
    description: "Growing inspection company seeking reliable field reps in the Dallas area. Fast payment, consistent work.",
    postedDate: "2 days ago",
    isAcceptingReps: true
  },
  {
    id: "2", 
    companyName: "Lone Star Inspections",
    location: "Fort Worth, TX",
    distance: "12 miles",
    monthlyVolume: "25-40 orders",
    paymentRange: "$60-85",
    workTypes: ["Commercial Inspections", "REO Inspections"],
    platforms: ["Solidifi", "Direct Lender"],
    description: "Established company with 10+ years experience. Looking for experienced inspectors for commercial work.",
    postedDate: "1 week ago",
    isAcceptingReps: true
  }
];

const FieldRepSearchResults = ({ filters }: FieldRepSearchResultsProps) => {
  const [selectedVendor, setSelectedVendor] = useState<typeof mockVendors[0] | null>(null);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (selectedVendor && message.trim()) {
      // Here you would typically send the message to the backend
      alert(`Message sent to ${selectedVendor.companyName}!`);
      setMessage("");
      setSelectedVendor(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Work Opportunities in {filters.zipCode}
        </h2>
        <Badge variant="secondary">
          {mockVendors.length} opportunities found
        </Badge>
      </div>

      <div className="grid gap-6">
        {mockVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {vendor.companyName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {vendor.location} • {vendor.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {vendor.postedDate}
                    </span>
                  </CardDescription>
                </div>
                {vendor.isAcceptingReps && (
                  <Badge variant="default">Accepting Reps</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{vendor.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">Payment Range:</span>
                    <Badge variant="outline">{vendor.paymentRange}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Monthly Volume:</span>
                    <Badge variant="outline">{vendor.monthlyVolume}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Work Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendor.workTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Platforms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendor.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact {vendor.companyName}</DialogTitle>
                      <DialogDescription>
                        Send a message to express your interest in working with this vendor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Hi, I'm interested in working as a field representative for your company. I have experience in..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSendMessage} className="flex-1">
                          Send Message
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockVendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No work opportunities found for your search criteria.
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or expanding your search area.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FieldRepSearchResults;
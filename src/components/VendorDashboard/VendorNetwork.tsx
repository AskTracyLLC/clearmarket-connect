import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Calendar, MapPin, MessageCircle, Star, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const VendorNetwork = () => {
  // Mock network data
  const networkReps = [
    {
      id: 1,
      initials: "J.D.",
      name: "John Davis",
      location: "Los Angeles, CA",
      platforms: ["CoreLogic", "Clear Capital"],
      connectedDate: "2024-01-15",
      method: "Unlocked",
      lastActive: "2 days ago",
      rating: 4.8,
      completedJobs: 145
    },
    {
      id: 2,
      initials: "S.M.",
      name: "Sarah Miller",
      location: "Dallas, TX",
      platforms: ["ServiceLink", "AMC"],
      connectedDate: "2024-02-08",
      method: "Referral",
      lastActive: "1 week ago",
      rating: 4.9,
      completedJobs: 89
    },
    {
      id: 3,
      initials: "R.W.",
      name: "Robert Wilson",
      location: "Miami, FL",
      platforms: ["Clear Capital", "Solidifi"],
      connectedDate: "2024-01-22",
      method: "Unlocked",
      lastActive: "Yesterday",
      rating: 4.7,
      completedJobs: 234
    },
    {
      id: 4,
      initials: "L.C.",
      name: "Lisa Chen",
      location: "Brooklyn, NY",
      platforms: ["CoreLogic", "ServiceLink", "AMC"],
      connectedDate: "2024-03-01",
      method: "Unlocked",
      lastActive: "3 hours ago",
      rating: 5.0,
      completedJobs: 67
    }
  ];

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Network
          </CardTitle>
          <CardDescription>
            Field Reps you've connected with and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkReps.map((rep) => (
              <Card key={rep.id} className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {rep.initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{rep.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {rep.location}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {rep.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Connected: {new Date(rep.connectedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            {rep.rating} ({rep.completedJobs} jobs)
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Badge variant={getMethodBadgeVariant(rep.method)}>
                        {rep.method}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            View Reviews
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            View Availability
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-muted">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last active: {rep.lastActive}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {networkReps.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Field Reps Connected</h3>
              <p className="text-muted-foreground mb-4">
                Start building your network by searching for Field Reps in your coverage areas.
              </p>
              <Button>
                Find Field Reps
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorNetwork;
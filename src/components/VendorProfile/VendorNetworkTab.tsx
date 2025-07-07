import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Calendar, Eye, Unlock, UserPlus, Gift } from "lucide-react";
import { mockCurrentVendor } from "@/data/mockVendorData";
import { mockResults } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";

const VendorNetworkTab = () => {
  const networkReps = mockCurrentVendor.network.map(networkRep => {
    // Find the full rep data from mockResults
    const fullRepData = mockResults.find(rep => rep.id === networkRep.repId);
    return {
      ...networkRep,
      ...fullRepData,
    };
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'unlocked':
        return <Unlock className="h-4 w-4 text-blue-600" />;
      case 'referred':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'confirmed':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      default:
        return <UserPlus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'unlocked':
        return 'Credit Unlock';
      case 'referred':
        return 'Referral';
      case 'confirmed':
        return 'Manual Add';
      default:
        return method;
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'unlocked':
        return 'secondary';
      case 'referred':
        return 'default';
      case 'confirmed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{networkReps.length}</p>
                <p className="text-sm text-muted-foreground">Total Network Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Unlock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {networkReps.filter(rep => rep.addedMethod === 'unlocked').length}
                </p>
                <p className="text-sm text-muted-foreground">Unlocked with Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {networkReps.filter(rep => rep.addedMethod === 'referred').length}
                </p>
                <p className="text-sm text-muted-foreground">Referred Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            My Network ({networkReps.length} reps)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {networkReps.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Reps in Your Network Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your network by searching for field reps and unlocking their contact information.
              </p>
              <Button variant="outline" asChild>
                <a href="/vendor/search">Search for Reps</a>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead>How Added</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkReps.map((rep) => (
                  <TableRow key={rep.repId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary text-sm">{rep.repInitials}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{rep.repInitials}</p>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              In Network
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{rep.distance || 'N/A'}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rep.platforms?.slice(0, 2).map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform.replace('inspections', '').replace('Inspector', '')}
                          </Badge>
                        ))}
                        {rep.platforms && rep.platforms.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{rep.platforms.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(rep.addedMethod)}
                        <Badge variant={getMethodBadgeVariant(rep.addedMethod)} className="text-xs">
                          {getMethodLabel(rep.addedMethod)}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(rep.addedDate, { addSuffix: true })}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorNetworkTab;
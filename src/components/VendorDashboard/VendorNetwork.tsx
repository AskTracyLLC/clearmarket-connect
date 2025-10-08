import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Calendar, MapPin, MessageCircle, Star, MoreHorizontal, Send, NotebookPen, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SendNetworkAlertModal from './SendNetworkAlertModal';
import UserCommentModal from '@/components/ui/UserCommentModal';
import { useNetworkConnections } from '@/hooks/useNetworkConnections';

const VendorNetwork = () => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string; name: string; initials: string} | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'state'>('name');
  
  const { connections, isLoading } = useNetworkConnections();

  // Sort connections
  const sortedConnections = useMemo(() => {
    const sorted = [...connections];
    if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const nameA = a.anonymous_username;
        const nameB = b.anonymous_username;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'state') {
      sorted.sort((a, b) => {
        const stateA = a.state || '';
        const stateB = b.state || '';
        return stateA.localeCompare(stateB);
      });
    }
    return sorted;
  }, [connections, sortBy]);

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'unlocked':
        return 'default';
      case 'referral':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleOpenComment = (connection: any) => {
    const name = connection.anonymous_username;
    const initials = connection.anonymous_username.substring(0, 2).toUpperCase();
    
    setSelectedUser({
      id: connection.user_id,
      name: name,
      initials: initials
    });
    setCommentModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedConnections.map(c => c.user_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const isAllSelected = sortedConnections.length > 0 && selectedIds.size === sortedConnections.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < sortedConnections.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Network ({sortedConnections.length})
              </CardTitle>
              <CardDescription>
                Field Reps you've connected with and their details
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'name' | 'state')}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="state">Sort by State</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setAlertModalOpen(true)} 
                className="flex items-center gap-2"
                disabled={selectedIds.size === 0}
              >
                <Send className="h-4 w-4" />
                Send Alert ({selectedIds.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading network...</p>
            </div>
          ) : sortedConnections.length === 0 ? (
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
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Connected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedConnections.map((connection) => {
                    const name = connection.anonymous_username;
                    const initials = connection.anonymous_username.substring(0, 2).toUpperCase();
                    const location = connection.city && connection.state 
                      ? `${connection.city}, ${connection.state}`
                      : connection.state || connection.location || 'N/A';
                    
                    return (
                      <TableRow key={connection.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.has(connection.user_id)}
                            onCheckedChange={(checked) => handleSelectOne(connection.user_id, checked as boolean)}
                            aria-label={`Select ${name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">{connection.role === 'field_rep' ? 'Field Rep' : 'Vendor'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {location}
                          </div>
                        </TableCell>
                        <TableCell>
                          {connection.trust_score ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span className="font-medium">{connection.trust_score.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMethodBadgeVariant(connection.connection_method)} className="capitalize">
                            {connection.connection_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(connection.connected_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenComment(connection)}>
                                <NotebookPen className="h-4 w-4 mr-2" />
                                Private Notes
                              </DropdownMenuItem>
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SendNetworkAlertModal 
        open={alertModalOpen}
        onOpenChange={setAlertModalOpen}
        networkSize={sortedConnections.length}
        selectedIds={Array.from(selectedIds)}
      />
      
      <UserCommentModal
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
        targetUser={selectedUser}
      />
    </div>
  );
};

export default VendorNetwork;
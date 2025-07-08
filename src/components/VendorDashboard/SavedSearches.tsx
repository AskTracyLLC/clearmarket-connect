import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookmarkPlus, Search, MapPin, Calendar, Filter, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const SavedSearches = () => {
  const [searchName, setSearchName] = useState('');

  // Mock saved searches data
  const savedSearches = [
    {
      id: 1,
      name: "LA Metro BPO Inspections",
      location: "Los Angeles, CA",
      zipCode: "90210",
      platforms: ["CoreLogic", "Clear Capital"],
      inspectionTypes: ["Exterior", "Interior"],
      abcRequired: true,
      hudKeyRequired: false,
      savedDate: "2024-03-01",
      lastRun: "2024-03-10",
      resultsCount: 8
    },
    {
      id: 2,
      name: "Dallas Full Service",
      location: "Dallas, TX",
      zipCode: "75201",
      platforms: ["ServiceLink", "AMC"],
      inspectionTypes: ["Interior", "Occupancy"],
      abcRequired: false,
      hudKeyRequired: true,
      savedDate: "2024-02-15",
      lastRun: "2024-03-08",
      resultsCount: 5
    },
    {
      id: 3,
      name: "NYC Emergency Coverage",
      location: "New York, NY",
      zipCode: "10001",
      platforms: ["CoreLogic"],
      inspectionTypes: ["Exterior"],
      abcRequired: true,
      hudKeyRequired: false,
      savedDate: "2024-01-20",
      lastRun: "2024-03-05",
      resultsCount: 12
    }
  ];

  const handleRunSearch = (search: any) => {
    console.log('Running search:', search);
    // Navigate to search results with these filters
  };

  const handleEditSearch = (search: any) => {
    console.log('Editing search:', search);
    // Open edit modal or navigate to search form with pre-filled data
  };

  const handleDeleteSearch = (searchId: number) => {
    console.log('Deleting search:', searchId);
    // Delete search from saved searches
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Saved Searches
          </CardTitle>
          <CardDescription>
            Quick access to your frequently used search criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Save Current Search */}
          <div className="bg-muted/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Save Current Search</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search name (e.g., 'LA Metro BPO Inspections')"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1"
              />
              <Button disabled={!searchName.trim()}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Saved Searches List */}
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <Card key={search.id} className="border border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-semibold text-foreground">{search.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {search.location} ({search.zipCode})
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Platforms:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {search.platforms.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {search.inspectionTypes.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {search.abcRequired && (
                            <Badge variant="default" className="text-xs">ABC# Required</Badge>
                          )}
                          {search.hudKeyRequired && (
                            <Badge variant="default" className="text-xs">HUD Key Required</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-muted">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Saved: {new Date(search.savedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Search className="h-3 w-3" />
                            Last run: {new Date(search.lastRun).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {search.resultsCount} results
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleRunSearch(search)}
                        className="whitespace-nowrap"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Run Search
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSearch(search)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Search
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSearch(search.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Search
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {savedSearches.length === 0 && (
            <div className="text-center py-12">
              <BookmarkPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
              <p className="text-muted-foreground mb-4">
                Save your frequently used search filters for quick access later.
              </p>
              <Button>
                Create Your First Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedSearches;
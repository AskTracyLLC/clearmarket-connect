import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar, MapPin, Eye, Users, Edit, Pause, Play, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CoverageRequests = () => {
  // Mock coverage requests data
  const coverageRequests = [
    {
      id: 1,
      title: "Urgent BPO Coverage Needed - Downtown LA",
      location: "Los Angeles, CA 90013",
      inspectionTypes: ["Exterior", "Interior"],
      platforms: ["CoreLogic", "Clear Capital"],
      description: "Need reliable Field Rep for ongoing BPO work in downtown LA area. Volume expected 10-15 per week.",
      budget: "$75-85 per inspection",
      status: "active",
      postedDate: "2024-03-08",
      expiresDate: "2024-04-08",
      views: 24,
      responses: 5,
      requirements: {
        abcRequired: true,
        hudKeyRequired: false,
        yearsExperience: "2+"
      }
    },
    {
      id: 2,
      title: "REO Inspection Coverage - Dallas Metro",
      location: "Dallas, TX 75201",
      inspectionTypes: ["Interior", "Occupancy"],
      platforms: ["ServiceLink", "AMC"],
      description: "Seeking experienced Field Rep for REO inspections across Dallas metro area.",
      budget: "$95-110 per inspection",
      status: "paused",
      postedDate: "2024-02-28",
      expiresDate: "2024-03-28",
      views: 18,
      responses: 3,
      requirements: {
        abcRequired: false,
        hudKeyRequired: true,
        yearsExperience: "3+"
      }
    },
    {
      id: 3,
      title: "High Volume Exterior Coverage - Phoenix",
      location: "Phoenix, AZ 85001",
      inspectionTypes: ["Exterior"],
      platforms: ["CoreLogic"],
      description: "High volume exterior inspection opportunity. Must be able to handle 20+ inspections per week.",
      budget: "$45-55 per inspection",
      status: "completed",
      postedDate: "2024-01-15",
      expiresDate: "2024-02-15",
      views: 42,
      responses: 12,
      requirements: {
        abcRequired: true,
        hudKeyRequired: false,
        yearsExperience: "1+"
      }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditRequest = (requestId: number) => {
    console.log('Editing request:', requestId);
  };

  const handlePauseResume = (requestId: number, currentStatus: string) => {
    console.log(`${currentStatus === 'active' ? 'Pausing' : 'Resuming'} request:`, requestId);
  };

  const handleDeleteRequest = (requestId: number) => {
    console.log('Deleting request:', requestId);
  };

  const handleViewResponses = (requestId: number) => {
    console.log('Viewing responses for request:', requestId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Posted Coverage Requests
              </CardTitle>
              <CardDescription>
                Manage your active and past coverage requests
              </CardDescription>
            </div>
            <Button>
              <Megaphone className="h-4 w-4 mr-2" />
              Post New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {coverageRequests.map((request) => (
              <Card key={request.id} className="border border-muted">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-3">
                        <h3 className="font-semibold text-foreground text-lg">{request.title}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {request.location}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRequest(request.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Request
                        </DropdownMenuItem>
                        {request.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handlePauseResume(request.id, request.status)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Request
                          </DropdownMenuItem>
                        ) : request.status === 'paused' ? (
                          <DropdownMenuItem onClick={() => handlePauseResume(request.id, request.status)}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume Request
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{request.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Inspection Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.inspectionTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Platforms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Budget:</span>
                        <div className="text-sm font-semibold text-foreground">{request.budget}</div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Requirements:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.requirements.abcRequired && (
                            <Badge variant="default" className="text-xs">ABC# Required</Badge>
                          )}
                          {request.requirements.hudKeyRequired && (
                            <Badge variant="default" className="text-xs">HUD Key Required</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {request.requirements.yearsExperience} Experience
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-muted">
                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Posted: {new Date(request.postedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(request.expiresDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {request.views} views
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewResponses(request.id)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {request.responses} Responses
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {coverageRequests.length === 0 && (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Coverage Requests</h3>
              <p className="text-muted-foreground mb-4">
                Post your first coverage request to find Field Reps in areas you need.
              </p>
              <Button>
                <Megaphone className="h-4 w-4 mr-2" />
                Post Coverage Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoverageRequests;
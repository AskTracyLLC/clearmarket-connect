import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Wrench, MessageCircle } from "lucide-react";
import SimpleCommunityFeed from "@/components/SimpleCommunityFeed";

const CommunityBoard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("community");
  const [category, setCategory] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");

  const jobTypes = [
    "Occupancy Checks",
    "Disaster",
    "Pre-Listing",
    "Maintenance",
    "Compliance",
    "Emergency"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all listings"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
              <TabsTrigger 
                value="community" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 px-6 text-sm font-medium"
              >
                Community
              </TabsTrigger>
              <TabsTrigger 
                value="your-posts" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 px-6 text-sm font-medium"
              >
                Your Posts
              </TabsTrigger>
              <TabsTrigger 
                value="saved-posts" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 px-6 text-sm font-medium"
              >
                Saved Posts
              </TabsTrigger>
              <TabsTrigger 
                value="support" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 px-6 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Support
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
              {/* Categories */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Categories:</span>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="vendor">Vendor Posts</SelectItem>
                    <SelectItem value="field-rep">Field Rep Posts</SelectItem>
                    <SelectItem value="local-news">Local News</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Type Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Job Type:</span>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium">Sort By:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="top-day">Top - Day</SelectItem>
                    <SelectItem value="top-week">Top - Week</SelectItem>
                    <SelectItem value="top-month">Top - Month</SelectItem>
                    <SelectItem value="top-year">Top - Year</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tab Content */}
            <TabsContent value="community" className="space-y-4">
              <SimpleCommunityFeed 
                section="community"
                primaryView={category === "all" ? "all" : category}
                secondaryFilter={sortBy}
                searchTerm={searchTerm}
                jobTypeFilter={jobType}
              />
            </TabsContent>

            <TabsContent value="your-posts" className="space-y-4">
              <SimpleCommunityFeed 
                section="user-posts"
                primaryView="user"
                secondaryFilter={sortBy}
                searchTerm={searchTerm}
                jobTypeFilter={jobType}
              />
            </TabsContent>

            <TabsContent value="saved-posts" className="space-y-4">
              <SimpleCommunityFeed 
                section="saved-posts"
                primaryView="saved"
                secondaryFilter={sortBy}
                searchTerm={searchTerm}
                jobTypeFilter={jobType}
              />
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <div className="bg-muted/20 rounded-lg p-6 border-2 border-dashed border-muted-foreground/20">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Support & Feedback</h3>
                    <p className="text-muted-foreground mb-4">
                      Report bugs, submit feature requests, and access our internal feedback board.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" onClick={() => navigate('/feedback')}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View Feedback Board
                      </Button>
                      <Button onClick={() => navigate('/feedback')}>
                        Submit Feedback
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityBoard;
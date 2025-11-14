import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Wrench } from "lucide-react";
import SimpleCommunityFeed from "@/components/SimpleCommunityFeed";
import { FeedbackBoardNew } from "@/components/FeedbackBoardNew";
import LocalNewsSearch from "@/components/LocalNewsSearch";
import { useWorkTypes } from "@/hooks/useWorkTypes";
import { statesAndCounties } from "@/data/statesAndCounties";

const CommunityBoard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("community");
  const { workTypes, loading: workTypesLoading } = useWorkTypes();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  const [category, setCategory] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [state, setState] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");

  const jobTypes = workTypes.map(wt => wt.name);

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
                placeholder="Search posts, topics, vendors, inspection types..."
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

            {/* Filter Bar - Hidden for Support tab since it has its own filters */}
            {activeTab !== "support" && (
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

              {/* State Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">State:</span>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {statesAndCounties.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
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
            )}

            {/* Tab Content */}
            <TabsContent value="community" className="space-y-4">
              {category === "local-news" ? (
                <LocalNewsSearch />
              ) : (
                <SimpleCommunityFeed 
                  section="community"
                  primaryView={category === "all" ? "all" : category}
                  secondaryFilter={sortBy}
                  searchTerm={searchTerm}
                  jobTypeFilter={jobType}
                  stateFilter={state}
                />
              )}
            </TabsContent>

            <TabsContent value="your-posts" className="space-y-4">
              <SimpleCommunityFeed 
                section="user-posts"
                primaryView="user"
                secondaryFilter={sortBy}
                searchTerm={searchTerm}
                jobTypeFilter={jobType}
                stateFilter={state}
              />
            </TabsContent>

            <TabsContent value="saved-posts" className="space-y-4">
              <SimpleCommunityFeed 
                section="saved-posts"
                primaryView="saved"
                secondaryFilter={sortBy}
                searchTerm={searchTerm}
                jobTypeFilter={jobType}
                stateFilter={state}
              />
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <FeedbackBoardNew />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityBoard;
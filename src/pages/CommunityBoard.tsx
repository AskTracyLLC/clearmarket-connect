import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import SimpleCommunityFeed from "@/components/SimpleCommunityFeed";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";

const CommunityBoard = () => {
  const navigate = useNavigate();
  const [primaryView, setPrimaryView] = useState("all");
  const [secondaryFilter, setSecondaryFilter] = useState("recent");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Board</h1>
            <p className="text-muted-foreground">Connect with Field Reps and Vendors in our community forums</p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Primary View Dropdown */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">View</label>
              <Select value={primaryView} onValueChange={setPrimaryView}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="for-you">For You</SelectItem>
                  <SelectItem value="local-news">Local News</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Filter Dropdown */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sort</label>
              <Select value={secondaryFilter} onValueChange={setSecondaryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="top-day">Top - By Day</SelectItem>
                  <SelectItem value="top-week">Top - By Week</SelectItem>
                  <SelectItem value="top-month">Top - By Month</SelectItem>
                  <SelectItem value="top-year">Top - By Year</SelectItem>
                  <SelectItem value="saved">Saved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Community Feed */}
          <Card>
            <CardContent className="p-6">
              <SimpleCommunityFeed 
                primaryView={primaryView}
                secondaryFilter={secondaryFilter}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityBoard;
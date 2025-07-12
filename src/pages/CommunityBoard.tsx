import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SimpleCommunityFeed from "@/components/SimpleCommunityFeed";
import SavedPostsList from "@/components/SavedPostsList";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";

const CommunityBoard = () => {
  const navigate = useNavigate();
  const fieldRepPosts = useCommunityPosts('field-rep-forum');
  const vendorPosts = useCommunityPosts('vendor-bulletin');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Board</h1>
            <p className="text-muted-foreground">Connect with Field Reps and Vendors in our community forums</p>
          </div>

          <Tabs defaultValue="field-rep-forum" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="field-rep-forum">Field Rep Forum</TabsTrigger>
              <TabsTrigger value="vendor-bulletin">Vendor Bulletin</TabsTrigger>
              <TabsTrigger value="saved">My Saved</TabsTrigger>
              <TabsTrigger value="support" onClick={() => navigate('/feedback')}>Support Center</TabsTrigger>
            </TabsList>

            <TabsContent value="field-rep-forum" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Field Rep Forum</CardTitle>
                  <p className="text-muted-foreground">Share questions, tips, and discussions with fellow field representatives</p>
                </CardHeader>
                <CardContent>
                  <SimpleCommunityFeed section="field-rep-forum" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendor-bulletin" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Bulletin</CardTitle>
                  <p className="text-muted-foreground">Vendor announcements, coverage needs, and industry updates</p>
                </CardHeader>
                <CardContent>
                  <SimpleCommunityFeed section="vendor-bulletin" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Saved Posts</CardTitle>
                  <p className="text-muted-foreground">Posts you've saved for later reference</p>
                </CardHeader>
                <CardContent>
                  <SavedPostsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              {/* This will redirect to /feedback so this content won't be seen */}
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">Redirecting to Support Center...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityBoard;
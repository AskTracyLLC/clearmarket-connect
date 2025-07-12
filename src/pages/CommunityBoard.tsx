import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimpleCommunityFeed from "@/components/SimpleCommunityFeed";

const CommunityBoard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <SimpleCommunityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default CommunityBoard;
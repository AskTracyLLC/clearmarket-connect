import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommunityFeed from "@/components/CommunityFeed";

const CommunityBoard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default CommunityBoard;
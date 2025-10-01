import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FeedbackBoardNew } from "@/components/FeedbackBoardNew";

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Platform Support & Known Issues</h1>
            <p className="text-muted-foreground">
              Transparency hub for all reported issues, feature requests, and platform updates. 
              Track what we're working on and share your feedback.
            </p>
          </div>
          <FeedbackBoardNew />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;

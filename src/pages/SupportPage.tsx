import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FeedbackBoardNew } from "@/components/FeedbackBoardNew";
import { PlatformWorkTypeRequests } from "@/components/admin/PlatformWorkTypeRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          
          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="feedback">Feedback & Issues</TabsTrigger>
              <TabsTrigger value="requests">Platform/Inspection Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feedback">
              <FeedbackBoardNew />
            </TabsContent>
            
            <TabsContent value="requests">
              <PlatformWorkTypeRequests />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;

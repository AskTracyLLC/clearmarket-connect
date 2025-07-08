import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MessageInbox from "@/components/messaging/MessageInbox";

const MessagesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <MessageInbox />
      </main>
      <Footer />
    </div>
  );
};

export default MessagesPage;
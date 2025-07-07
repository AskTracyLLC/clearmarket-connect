import Header from '@/components/Header';
import { FeedbackBoard } from '@/components/FeedbackBoard';
import Footer from '@/components/Footer';

const FeedbackPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FeedbackBoard />
      <Footer />
    </div>
  );
};

export default FeedbackPage;
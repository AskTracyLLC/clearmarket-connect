import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorState from "@/components/ui/error-states";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <ErrorState 
          type="404"
          title="Page Not Found"
          message="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
        />
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

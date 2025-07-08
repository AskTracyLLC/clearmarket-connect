import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCenter from "@/components/resources/ResourceCenter";

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ResourceCenter />
      </main>
      <Footer />
    </div>
  );
};

export default ResourcesPage;
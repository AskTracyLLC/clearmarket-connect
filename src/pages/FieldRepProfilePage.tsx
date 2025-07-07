import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldRepProfile from "@/components/FieldRepProfile";

const FieldRepProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <FieldRepProfile />
      </main>
      <Footer />
    </div>
  );
};

export default FieldRepProfilePage;
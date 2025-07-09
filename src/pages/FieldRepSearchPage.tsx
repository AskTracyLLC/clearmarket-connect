import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldRepSearch from "@/components/FieldRepSearch";

const FieldRepSearchPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <FieldRepSearch />
      </main>
      <Footer />
    </div>
  );
};

export default FieldRepSearchPage;
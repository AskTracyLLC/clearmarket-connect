import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorSearch from "@/components/VendorSearch";

const VendorSearchPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <VendorSearch />
      </main>
      <Footer />
    </div>
  );
};

export default VendorSearchPage;
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorProfile from "@/components/VendorProfile";

const VendorProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <VendorProfile />
      </main>
      <Footer />
    </div>
  );
};

export default VendorProfilePage;
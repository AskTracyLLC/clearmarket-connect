
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminProfile from "@/components/AdminProfile";

const AdminProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <AdminProfile />
      </main>
      <Footer />
    </div>
  );
};

export default AdminProfilePage;

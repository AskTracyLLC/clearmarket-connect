import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldRepProfile from "@/components/FieldRepProfile";
import UserDocuments from "@/components/profile/UserDocuments";

const FieldRepProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <FieldRepProfile />
        <div className="mt-8">
          <UserDocuments onDocumentAdded={(doc) => console.log('New document:', doc)} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FieldRepProfilePage;

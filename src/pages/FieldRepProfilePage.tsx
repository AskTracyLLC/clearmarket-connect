import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldRepProfile from "@/components/FieldRepProfile";
import UserDocuments from "@/components/profile/UserDocuments";
import TrustScoreDisplay from "@/components/TrustScore/TrustScoreDisplay";
import TrustScoreReviewList from "@/components/TrustScore/TrustScoreReviewList";
import { useTrustScore } from "@/hooks/useTrustScore";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const FieldRepProfilePage = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { trustScore, reviews, hideReviewWithCredits, disputeReview, featureReview } = useTrustScore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePreviewProfile = () => {
    if (user?.id) {
      navigate(`/fieldrep/public/${user.id}`);
    }
  };

  useEffect(() => {
    if (profile?.profile_complete && profile.profile_complete >= 100) {
      toast({
        title: "Profile complete",
        description: "Redirecting to your dashboard...",
      });
      navigate('/fieldrep/dashboard', { replace: true });
    }
  }, [profile?.profile_complete, navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 mb-6 flex justify-end">
          <Button variant="outline" onClick={handlePreviewProfile}>
            <Eye className="h-4 w-4 mr-2" />
            Preview My Public Profile
          </Button>
        </div>
        <FieldRepProfile />
        
        {/* Trust Score Section */}
        <div className="container mx-auto px-4 mt-8 space-y-8">
          {trustScore && profile && (
            <TrustScoreDisplay
              trustScore={trustScore}
              userRole="field_rep"
              displayName={profile.display_name || profile.anonymous_username}
            />
          )}
          
          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Trust Score Reviews</h2>
            <TrustScoreReviewList
              reviews={reviews}
              userRole="field_rep"
              isOwnProfile={true}
              onHideReview={hideReviewWithCredits}
              onDisputeReview={disputeReview}
              onFeatureReview={featureReview}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <UserDocuments onDocumentAdded={(doc) => console.log('New document:', doc)} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FieldRepProfilePage;

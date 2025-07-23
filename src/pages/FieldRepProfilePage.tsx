import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldRepProfile from "@/components/FieldRepProfile";
import UserDocuments from "@/components/profile/UserDocuments";
import TrustScoreDisplay from "@/components/TrustScore/TrustScoreDisplay";
import TrustScoreReviewList from "@/components/TrustScore/TrustScoreReviewList";
import { useTrustScore } from "@/hooks/useTrustScore";
import { useUserProfile } from "@/hooks/useUserProfile";

const FieldRepProfilePage = () => {
  const { profile } = useUserProfile();
  const { trustScore, reviews, hideReviewWithCredits, disputeReview, featureReview } = useTrustScore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
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

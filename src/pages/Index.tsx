import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SuccessStoriesSection from "@/components/SuccessStoriesSection";
import RecentlyJoinedCarousel from "@/components/RecentlyJoinedCarousel";
import FAQSection from "@/components/FAQSection";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { settings } = usePublicSettings();
  const { user } = useAuth();
  const { accountData } = useUserProfile();
  const navigate = useNavigate();

  // ADD THIS: Redirect root to pre-launch during pre-launch phase
  useEffect(() => {
    if (window.location.pathname === '/' && !window.location.search && !window.location.hash) {
      window.location.replace('/pre-launch');
    }
  }, []);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && accountData) {
      const role = accountData.role || "field_rep";
      const dashboardPath = role === "vendor" ? "/vendor/dashboard" : "/fieldrep/dashboard";
      navigate(dashboardPath);
    }
  }, [user, accountData, navigate]);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      setShowHowItWorks(hash === "#how-it-works");
      setShowPricing(hash === "#pricing");
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  useEffect(() => {
    if (showHowItWorks) {
      const element = document.getElementById("how-it-works");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [showHowItWorks]);

  useEffect(() => {
    if (showPricing) {
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [showPricing]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      {settings.testimonials_section_visible && <TestimonialsSection />}
      {settings.success_stories_section_visible && <SuccessStoriesSection />}
      <RecentlyJoinedCarousel />
      <FAQSection />
      <HowItWorks />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

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
      {showHowItWorks && <HowItWorks />}
      {showPricing && <PricingSection />}
      <Footer />
    </div>
  );
};

export default Index;

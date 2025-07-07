import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setShowHowItWorks(window.location.hash === "#how-it-works");
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      {showHowItWorks && <HowItWorks />}
      <Footer />
    </div>
  );
};

export default Index;

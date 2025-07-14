import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const PreLaunch = () => {
  const { settings } = usePublicSettings();
  const { user } = useAuth();
  const { accountData } = useUserProfile();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && accountData) {
      const role = accountData.role || "field_rep";
      const dashboardPath = role === "vendor" ? "/vendor/dashboard" : "/fieldrep/dashboard";
      navigate(dashboardPath);
    }
  }, [user, accountData, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Feature Explanations Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What's In It For You?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how ClearMarket will transform your field inspection experience
            </p>
          </div>

          {/* For Field Representatives */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">
              👷 For Field Representatives
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Get discovered by quality vendors through smart matching</h4>
                <p className="text-muted-foreground">Your profile showcases your expertise to vendors seeking coverage in your area.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Build trust with verified reviews</h4>
                <p className="text-muted-foreground">Earn trust scores and community recognition for reliable work.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Access exclusive job locations in your coverage areas</h4>
                <p className="text-muted-foreground">Get first access to opportunities in your specified service areas.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Communicate with vendors and network more effectively</h4>
                <p className="text-muted-foreground">Direct messaging and networking tools to build professional relationships.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Connect with industry peers and share knowledge</h4>
                <p className="text-muted-foreground">Join a community of professionals sharing tips and best practices.</p>
              </div>
            </div>
          </div>

          {/* For Vendors */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">
              🏢 For Vendors
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Find reliable field reps in any service nationwide</h4>
                <p className="text-muted-foreground">Search and connect with verified field reps across all US markets.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Build your network confidently with trust scores</h4>
                <p className="text-muted-foreground">Make informed decisions with comprehensive trust and performance data.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Save time with location-based field rep discovery</h4>
                <p className="text-muted-foreground">Quickly find qualified reps in specific counties and regions.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Leverage peer referrals to get field rep recommendations</h4>
                <p className="text-muted-foreground">Get trusted recommendations from other vendors in the network.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-lg mb-3">Stay informed with vendor alerts and networking posts</h4>
                <p className="text-muted-foreground">Share opportunities and stay connected with the vendor community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Search Demo Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Coverage Anywhere in the US
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Search by state, county, or zip code to find qualified field representatives
            </p>
          </div>

          {/* Interactive Coverage Search Demo */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg border shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Coverage Search</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Search Location</label>
                      <input 
                        type="text" 
                        placeholder="Enter state, county, or zip code"
                        className="w-full p-3 border rounded-lg bg-background"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Inspection Type</label>
                      <select className="w-full p-3 border rounded-lg bg-background" disabled>
                        <option>All Types</option>
                        <option>Exterior</option>
                        <option>Interior</option>
                        <option>Occupancy</option>
                      </select>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-medium" disabled>
                      Search Field Reps
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Example Results</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Field Rep A.B.</h4>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Trust Score: 92</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Cook County, IL • 5+ years experience</p>
                      <p className="text-sm">Specializes in exterior inspections, CoreLogic platform</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Field Rep C.D.</h4>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Trust Score: 88</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">DuPage County, IL • 3+ years experience</p>
                      <p className="text-sm">Full-service inspections, multiple platforms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Building Something Great Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Building Something Great Takes Time
            </h2>
            <p className="text-xl mb-8 opacity-90">
              We're creating a platform that truly serves the field inspection community, with our founding members helping to shape every feature.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Community-Driven Development</h3>
                <p className="opacity-90">Built with input from real field reps and vendors</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Industry-Focused Features</h3>
                <p className="opacity-90">Designed specifically for property inspection professionals</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Transparent & Fair</h3>
                <p className="opacity-90">No hidden fees, no work assignments - just connections</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Want to Influence Development?</h3>
              <p className="text-lg mb-6 opacity-90">
                Join our founding members and help shape ClearMarket before we launch. Your feedback and expertise will directly influence our feature roadmap.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Join as Field Rep
                </button>
                <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
                  Join as Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PreLaunch;

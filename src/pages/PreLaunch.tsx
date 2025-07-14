import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const PreLaunch = () => {
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
      
      {/* Join ClearMarket Section */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Join ClearMarket - Help Shape Our Platform</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h3 className="font-semibold mb-2">📋 I'm a Field Rep</h3>
                  <p className="text-sm text-muted-foreground mb-4">Looking for work/money</p>
                  <button className="w-full bg-orange-500 text-white py-2 px-4 rounded">Field Rep</button>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-2">🏢 I'm a Vendor</h3>
                  <p className="text-sm text-muted-foreground mb-4">Seeking field coverage</p>
                  <button className="w-full border border-gray-300 py-2 px-4 rounded">Vendor</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for the Industry Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for the Industry, By the Industry</h2>
            <p className="text-muted-foreground">Every feature is designed specifically for field inspection professionals</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-semibold mb-2">Verified Professional Network</h3>
              <p className="text-sm text-muted-foreground">Connect with trusted field reps and vendors through our verified network</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Smart Coverage Mapping</h3>
              <p className="text-sm text-muted-foreground">Intuitive and smart coverage mapping across all 50 states and 3000+ counties</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold mb-2">Credit-Based Economy</h3>
              <p className="text-sm text-muted-foreground">Earn credits through community participation and use them to boost visibility</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold mb-2">Industry Community</h3>
              <p className="text-sm text-muted-foreground">Share knowledge and connect with industry professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* See ClearMarket in Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">See ClearMarket in Action</h2>
            <p className="text-muted-foreground">Preview the tools that will transform how you work</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Broadcast Updates */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-500">Broadcast Updates to Your Entire Network</h3>
              <p className="text-muted-foreground mb-6">Send any message to your entire network of connected reps, from work alerts to scheduling announcements.</p>
              
              <div className="bg-card border rounded-lg p-4">
                <div className="mb-4">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Network Alert</span>
                  <span className="text-xs text-muted-foreground ml-2">Sent</span>
                </div>
                <div className="mb-2">
                  <strong>Subject:</strong> Travel Schedule Update - Multi-County Coverage
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Good morning everyone,<br/><br/>
                  HEADS-UP: Starting in Cook County at 9 AM - then 1 PM...
                </div>
                <div className="text-xs text-muted-foreground">
                  • 67 recipients will receive this announcement...
                </div>
              </div>
            </div>

            {/* Find Coverage */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-500">Find Coverage Anywhere in the US</h3>
              <p className="text-muted-foreground mb-6">Search by state, county or zip code to find qualified field representatives in any area within minutes.</p>
              
              <div className="bg-card border rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Coverage Search</label>
                  <input 
                    className="w-full p-2 border rounded" 
                    placeholder="Search counties or zip codes..."
                    value="Cook County (7) reps"
                    readOnly 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">MB</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Mike Johnson</div>
                        <div className="text-xs text-muted-foreground">5+ service inspections, multiple platforms</div>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs">Available</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">AR</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Amanda Rodriguez</div>
                        <div className="text-xs text-muted-foreground">3+ service inspections, multiple platforms</div>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs">Available</button>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded">Request Coverage</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's In It For You */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">What's In It For You?</h2>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">👷</span> For Field Representatives
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Build your professional reputation amongst vendors</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Verify credentials and track performance history</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Access exclusive job locations in your coverage areas</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Communicate with all field reps regardless of platform used</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Manage your coverage network efficiently</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Stay informed with vendor alerts regardless of professional only</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Connect with industry peers and share knowledge</h4>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">🏢</span> For Vendors
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Verify credentials and track performance history</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Communicate with all field reps regardless of platform used</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Manage your coverage network efficiently</h4>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Stay informed with vendor alerts and networking posts</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Building Something Great Takes Time */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Building Something Great Takes Time
            </h2>
            <p className="text-xl mb-12 opacity-90">
              We're creating a platform that truly serves the field inspection community, with our founding members helping to shape every feature.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Gather Feedback</h3>
                <p className="opacity-90">Understanding the field inspection landscape through real experiences</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Beta Launch</h3>
                <p className="opacity-90">Launch in limited markets with founding members</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Full Platform</h3>
                <p className="opacity-90">Scale nationwide with full features and all regions</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Want to Influence Development?</h3>
              <p className="text-lg mb-6 opacity-90">
                Sign up above and check back this fall. Your option to help shape ClearMarket's features, pricing, and user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PreLaunch;

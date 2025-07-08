import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
            
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-6">Last updated: January 1, 2024</p>
              
              <div className="space-y-6 text-foreground">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using ClearMarket ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                  <p>
                    ClearMarket is a professional networking platform that connects property inspection professionals, including field representatives and vendors.
                    We provide tools for networking, communication, and business collaboration within the property inspection industry.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain accurate and current profile information</li>
                    <li>Use the platform professionally and respectfully</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not engage in fraudulent or misleading activities</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Credit System</h2>
                  <p>
                    Credits are earned through platform activities and can be used to unlock premium features.
                    Credits have no monetary value and cannot be exchanged for cash. Credit balances may expire according to platform policies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data</h2>
                  <p>
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform,
                    to understand our practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                  <p>
                    ClearMarket shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                    resulting from your use of the platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                  <p>
                    Questions about the Terms of Service should be sent to us at{" "}
                    <a href="mailto:support@clearmarket.io" className="text-primary hover:underline">
                      support@clearmarket.io
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
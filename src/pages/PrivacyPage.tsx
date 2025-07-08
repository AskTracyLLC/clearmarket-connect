import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
            
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-6">Last updated: January 1, 2024</p>
              
              <div className="space-y-6 text-foreground">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <p>We collect information you provide directly to us, such as:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Account information (name, email, phone number)</li>
                    <li>Professional profile details (services, coverage areas, experience)</li>
                    <li>Communication content (messages, posts, reviews)</li>
                    <li>Payment and billing information</li>
                    <li>Usage data and analytics</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Provide and maintain our services</li>
                    <li>Connect you with relevant professionals</li>
                    <li>Process payments and transactions</li>
                    <li>Send important updates and notifications</li>
                    <li>Improve our platform and user experience</li>
                    <li>Ensure platform security and prevent fraud</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                    except as described in this policy. We may share information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>With other platform users as part of your professional profile</li>
                    <li>With service providers who assist in platform operations</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information
                    against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Control communication preferences</li>
                    <li>Request data portability</li>
                    <li>Opt out of certain data processing activities</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                    and provide personalized content. You can control cookie settings through your browser.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
                  <p>
                    Our platform is not intended for individuals under 18 years of age.
                    We do not knowingly collect personal information from children under 18.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                  <p>
                    If you have questions about this Privacy Policy, please contact us at{" "}
                    <a href="mailto:privacy@clearmarket.io" className="text-primary hover:underline">
                      privacy@clearmarket.io
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

export default PrivacyPage;
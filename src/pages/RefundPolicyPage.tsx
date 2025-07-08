import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Refund Policy</h1>
            
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-6">Last updated: January 1, 2024</p>
              
              <div className="space-y-6 text-foreground">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. General Policy</h2>
                  <p>
                    ClearMarket strives to provide excellent service to all users. We understand that circumstances may arise
                    where a refund is warranted, and we are committed to handling such requests fairly and promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Credit Purchases</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Refund Eligibility</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Unused credits may be eligible for refund within 30 days of purchase</li>
                        <li>Credits used to unlock contact information or boost profiles are non-refundable</li>
                        <li>Accidental purchases reported within 24 hours will be reviewed for full refund</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Processing Time</h3>
                      <p>
                        Approved refunds will be processed within 5-7 business days and credited back to the original payment method.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Service Issues</h2>
                  <p>
                    If you experience technical issues that prevent you from using purchased credits or services,
                    we will work to resolve the issue promptly. If unable to resolve, we may provide:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Service credit or additional credits</li>
                    <li>Partial or full refund depending on the issue severity</li>
                    <li>Extended access to premium features</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Subscription Services</h2>
                  <div className="space-y-4">
                    <p>
                      For any future subscription-based services:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Cancellations can be made at any time through your account settings</li>
                      <li>No refunds for partial billing periods unless required by law</li>
                      <li>Service continues until the end of the current billing cycle</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Disputed Charges</h2>
                  <p>
                    If you notice an unauthorized charge on your account:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Contact us immediately at support@clearmarket.io</li>
                    <li>Provide transaction details and explanation</li>
                    <li>We will investigate and respond within 2 business days</li>
                    <li>Fraudulent charges will be refunded promptly</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. How to Request a Refund</h2>
                  <p>To request a refund:</p>
                  <ol className="list-decimal pl-6 space-y-2 mt-4">
                    <li>Email us at <a href="mailto:support@clearmarket.io" className="text-primary hover:underline">support@clearmarket.io</a></li>
                    <li>Include your account email and transaction details</li>
                    <li>Explain the reason for your refund request</li>
                    <li>Allow 2-3 business days for review and response</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Exceptions</h2>
                  <p>
                    Refunds may not be available for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Services already delivered or consumed</li>
                    <li>Violations of our Terms of Service</li>
                    <li>Requests made more than 90 days after purchase</li>
                    <li>Earned credits (non-purchased credits)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                  <p>
                    For refund requests or questions about this policy, contact us at{" "}
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

export default RefundPolicyPage;
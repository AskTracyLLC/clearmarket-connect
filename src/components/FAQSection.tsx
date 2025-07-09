import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";
const faqs = [{
  id: "credit-earning",
  question: "🎉 How to Earn Credits on ClearMarket",
  answer: <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Credits help you unlock contact info, boost visibility, and stay active on the platform — all without needing to pay out of pocket. Here's how to earn them:
        </p>
        
        <div>
          <h4 className="font-semibold mb-3 text-primary">🧠 Earn Credits Through Activity:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Action</th>
                  <th className="text-left p-2 font-medium">Credits Earned</th>
                  <th className="text-left p-2 font-medium">Limit</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-muted/30">
                  <td className="p-2">✅ Your post is marked "Helpful" by another user</td>
                  <td className="p-2">+1 credit for the first, +0.5 for the second, +0.25 for the third</td>
                  <td className="p-2">Diminishing after 3</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">👍 You mark someone else's post as "Helpful"</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">Max 1 credit/day</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📝 Leave a review for a Vendor you've worked with</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">No limit</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📝 Leave a review for a Field Rep in your network</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">No limit</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">👥 Refer someone who joins and becomes active (joins a Network)</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">Spam prevention in place</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📢 Send a Network Alert that vendors mark as "Helpful"</td>
                  <td className="p-2">+1 credit (first), +0.5 (second), +0.25 (third)</td>
                  <td className="p-2">Max 3 credits per alert</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">🌎 Connect to a Rep/Vendor in a new county</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">First connection only</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📸 Upload verified work history (admin approved)</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">No limit</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">💡 Submit a tip or best practice that's approved or rated helpful</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">No limit</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📬 Respond to vendor messages within 24 hours (weekly streak)</td>
                  <td className="p-2">+1 credit/week</td>
                  <td className="p-2">Ongoing bonus</td>
                </tr>
                <tr>
                  <td className="p-2">✅ Complete your full profile (100%)</td>
                  <td className="p-2">+1 credit</td>
                  <td className="p-2">One-time bonus</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-primary">🚀 Use Credits To:</h4>
          <ul className="space-y-2 text-sm">
            <li>🔓 Unlock contact details for Vendors or Field Reps</li>
            <li>💼 Boost your Field Rep profile to the top of local search results (Must meet minimum Trust Score and Community Score to qualify)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-primary">🔒 Protecting the System</h4>
          <ul className="space-y-1 text-sm">
            <li>• "Helpful" votes only count once per user per post</li>
            <li>• Daily caps prevent abuse (like toggling votes)</li>
            <li>• Referrals only count when the user becomes active (joins a Network)</li>
            <li>• Spam alerts or system misuse may result in credit removal</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Need more help?</strong> Visit your Credit Activity section to track how you're earning and spending your credits.
          </p>
        </div>
      </div>
}, {
  id: "how-it-works",
  question: "How does ClearMarket work?",
  answer: "ClearMarket connects Field Reps looking for work with Vendors seeking coverage. Vendors post their coverage needs, Field Reps apply or get matched based on location and expertise, and both parties can build trusted working relationships through our platform."
}, {
  id: "fees",
  question: "Is there a fee to join?",
  answer: "Joining ClearMarket is completely free for Field Reps. Vendors pay a small fee only when they successfully connect with and hire a Field Rep through our platform. No upfront costs, no monthly subscriptions."
}, {
  id: "unlock-contact",
  question: "What do I get when I unlock contact details?",
  answer: "When you unlock contact details, you get direct access to phone numbers, email addresses, and preferred communication methods. You also get access to detailed work history, availability calendars, and the ability to send direct messages through our platform."
}, {
  id: "trust-score",
  question: "How do I build my Trust Score?",
  answer: "Your Trust Score increases through verified completions, positive feedback, timely communication, profile completeness, and community participation. Background checks, platform certifications, and consistent quality work all contribute to a higher score."
}, {
  id: "systems",
  question: "What systems do I need to know?",
  answer: "Popular systems include InspectorADE, EZinspections, ClearVue, HUD keys, and various state-specific platforms. You can specify which systems you're familiar with in your profile to get matched with appropriate opportunities."
}, {
  id: "privacy",
  question: "Can I hide my profile or feedback?",
  answer: "You can control your profile visibility and choose who can see your contact information. However, feedback and ratings remain visible to maintain platform transparency and trust. You can respond to feedback publicly to provide context."
}, {
  id: "problems",
  question: "What happens if a job goes wrong?",
  answer: "We have a resolution process that includes direct communication tools, mediation services, and our support team. Both parties can leave feedback, and we work to resolve disputes fairly. Serious issues may affect Trust Scores."
}, {
  id: "report",
  question: "How do I report a problem?",
  answer: "Use the 'Report Issue' button on any profile or job posting, contact our support team directly through the platform, or email support@clearmarket.com. We investigate all reports promptly and take appropriate action."
}, {
  id: "data-protection",
  question: "How is my data protected?",
  answer: "We use industry-standard encryption, secure data storage, and strict access controls. Your personal information is never sold to third parties. You control what information is visible on your profile and can delete your account at any time."
}];
const FAQSection = () => {
  return <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            
            <p className="text-lg text-muted-foreground">
              Get answers to common questions about ClearMarket
            </p>
          </div>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Common Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map(faq => <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>)}
              </Accordion>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Still have questions? Use the contact form below!
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default FAQSection;
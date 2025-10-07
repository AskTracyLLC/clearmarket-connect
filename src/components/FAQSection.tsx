import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";
const faqs = [{
  id: "rep-points-earning",
  question: "How to Earn Rep Points on ClearMarket",
  answer: <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Rep Points reward community participation and enable giveaway entries. They cannot be purchased and are earned only through genuine engagement. Here's how to earn them:
        </p>
        
        <div>
          <h4 className="font-semibold mb-3 text-primary">🌟 Earn Rep Points Through Activity:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Action</th>
                  <th className="text-left p-2 font-medium">Rep Points Earned</th>
                  <th className="text-left p-2 font-medium">Limit</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-muted/30">
                  <td className="p-2">✅ Your post is marked "Helpful" by another user</td>
                  <td className="p-2">+1 point for first, +0.5 for second, +0.25 for third</td>
                  <td className="p-2">Diminishing returns</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">👍 You give helpful votes to others</td>
                  <td className="p-2">+1 point</td>
                  <td className="p-2">Max 1 per day</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">⭐ Leave verified vendor/field rep reviews</td>
                  <td className="p-2">+1 point each</td>
                  <td className="p-2">No limit</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">✅ Complete profile to 100%</td>
                  <td className="p-2">+5 points</td>
                  <td className="p-2">One-time bonus</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📅 Monthly active participation</td>
                  <td className="p-2">+5 points</td>
                  <td className="p-2">Monthly bonus</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">🏆 Trust Score milestones (80+ Trust Score)</td>
                  <td className="p-2">+15 points</td>
                  <td className="p-2">Achievement bonus</td>
                </tr>
                <tr className="border-b border-muted/30">
                  <td className="p-2">📬 Vendor message response streak</td>
                  <td className="p-2">+1 point per week</td>
                  <td className="p-2">Ongoing streak</td>
                </tr>
                <tr>
                  <td className="p-2">👥 Successful referrals (when referred user becomes active)</td>
                  <td className="p-2">+1 point</td>
                  <td className="p-2">Must be active user</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-destructive">⚠️ Use Rep Points For:</h4>
          <ul className="space-y-2 text-sm">
            <li>🎯 Enter monthly giveaways (5 Rep Points = 1 entry)</li>
            <li>🏢 Enter vendor network giveaways (cost varies by vendor)</li>
            <li>🚫 <strong>Cannot</strong> be purchased with money</li>
            <li>🚫 <strong>Cannot</strong> be used for platform features (use ClearCredits instead)</li>
          </ul>
        </div>

        <div className="bg-accent/10 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-accent">💳 For Platform Features - Use ClearCredits</h4>
          <ul className="space-y-2 text-sm">
            <li>🔓 Unlock contact information: 2 ClearCredits</li>
            <li>🚀 Boost profile visibility: 5 ClearCredits</li>
            <li>⭐ Access premium opportunities: 3 ClearCredits</li>
            <li>🎯 Priority customer support: 1 ClearCredit</li>
            <li>💡 ClearCredits are purchased with real money</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-primary">🔒 Protection Measures</h4>
          <ul className="space-y-1 text-sm">
            <li>• "Helpful" votes only count once per user per post</li>
            <li>• Daily caps prevent abuse and manipulation</li>
            <li>• Referrals only count when referred user becomes active</li>
            <li>• Review authenticity verified through work history</li>
            <li>• Spam or system misuse results in point removal</li>
            <li>• All transactions logged and auditable</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Need more help?</strong> Visit your dashboard to track Rep Points and ClearCredits separately in your balance section.
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
            
          </div>
        </div>
      </div>
    </section>;
};
export default FAQSection;
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    id: "how-it-works",
    question: "How does ClearMarket work?",
    answer: "ClearMarket connects Field Reps looking for work with Vendors seeking coverage. Vendors post their coverage needs, Field Reps apply or get matched based on location and expertise, and both parties can build trusted working relationships through our platform."
  },
  {
    id: "fees",
    question: "Is there a fee to join?",
    answer: "Joining ClearMarket is completely free for Field Reps. Vendors pay a small fee only when they successfully connect with and hire a Field Rep through our platform. No upfront costs, no monthly subscriptions."
  },
  {
    id: "unlock-contact",
    question: "What do I get when I unlock contact details?",
    answer: "When you unlock contact details, you get direct access to phone numbers, email addresses, and preferred communication methods. You also get access to detailed work history, availability calendars, and the ability to send direct messages through our platform."
  },
  {
    id: "trust-score",
    question: "How do I build my Trust Score?",
    answer: "Your Trust Score increases through verified completions, positive feedback, timely communication, profile completeness, and community participation. Background checks, platform certifications, and consistent quality work all contribute to a higher score."
  },
  {
    id: "systems",
    question: "What systems do I need to know?",
    answer: "Popular systems include InspectorADE, EZinspections, ClearVue, HUD keys, and various state-specific platforms. You can specify which systems you're familiar with in your profile to get matched with appropriate opportunities."
  },
  {
    id: "privacy",
    question: "Can I hide my profile or feedback?",
    answer: "You can control your profile visibility and choose who can see your contact information. However, feedback and ratings remain visible to maintain platform transparency and trust. You can respond to feedback publicly to provide context."
  },
  {
    id: "problems",
    question: "What happens if a job goes wrong?",
    answer: "We have a resolution process that includes direct communication tools, mediation services, and our support team. Both parties can leave feedback, and we work to resolve disputes fairly. Serious issues may affect Trust Scores."
  },
  {
    id: "report",
    question: "How do I report a problem?",
    answer: "Use the 'Report Issue' button on any profile or job posting, contact our support team directly through the platform, or email support@clearmarket.com. We investigate all reports promptly and take appropriate action."
  },
  {
    id: "data-protection",
    question: "How is my data protected?",
    answer: "We use industry-standard encryption, secure data storage, and strict access controls. Your personal information is never sold to third parties. You control what information is visible on your profile and can delete your account at any time."
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
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
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <Button variant="hero" size="lg">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
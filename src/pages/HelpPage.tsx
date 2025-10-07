import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileText, Users, Search, HelpCircle, BookOpen, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const HelpPage = () => {
  const helpTopics = [
    {
      icon: Users,
      title: "Getting Started",
      description: "Learn how to create your profile and start connecting",
      link: "/faq"
    },
    {
      icon: Search,
      title: "Finding Field Reps",
      description: "Tips for searching and filtering field representatives",
      link: "/vendor/search"
    },
    {
      icon: MessageCircle,
      title: "Network & Messaging",
      description: "How to connect with vendors and manage your network",
      link: "/faq"
    },
    {
      icon: FileText,
      title: "Account & Billing",
      description: "Manage your account settings and subscription",
      link: "/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get answers to your questions, find resources, or contact our support team
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Get help via email</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:support@useclearmarket.io"
                  className="text-primary hover:underline font-medium"
                >
                  support@useclearmarket.io
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  We typically respond within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community Support</CardTitle>
                <CardDescription>Connect with other users</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/community">
                  <Button variant="outline" className="w-full">
                    Visit Community
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  Ask questions and share experiences
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <HelpCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/faq">
                  <Button variant="outline" className="w-full">
                    Browse FAQ
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  Find instant answers to common issues
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Help Topics */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Help Topics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {helpTopics.map((topic) => (
                <Card key={topic.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <topic.icon className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <CardDescription>{topic.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={topic.link}>
                      <Button variant="link" className="px-0">
                        Learn more →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>More ways to get help and stay informed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <Link to="/support" className="font-medium hover:underline">
                      Platform Support & Known Issues
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Track bugs, feature requests, and platform updates
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <Link to="/terms" className="font-medium hover:underline">
                      Terms of Service
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Review our terms and policies
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <Link to="/privacy" className="font-medium hover:underline">
                      Privacy Policy
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Learn how we protect your data
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;

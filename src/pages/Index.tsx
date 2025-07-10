import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  MapPin, 
  Star, 
  Shield, 
  MessageSquare, 
  Mail, 
  CheckCircle,
  ArrowRight,
  Building,
  UserCheck,
  TrendingUp,
  Clock
} from 'lucide-react';

const Index = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [primaryState, setPrimaryState] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [statesCovered, setStatesCovered] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCount, setEmailCount] = useState(78);
  const [states, setStates] = useState([]);
  const { toast } = useToast();

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      const { data } = await supabase
        .from('states')
        .select('code, name')
        .order('name');
      if (data) setStates(data);
    };
    loadStates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !userType) return;

    // Field rep validation
    if (userType === 'field-rep' && !primaryState) {
      toast({
        title: "Missing Information",
        description: "Please select your primary state.",
        variant: "destructive"
      });
      return;
    }

    // Vendor validation
    if (userType === 'vendor' && !companyName) {
      toast({
        title: "Missing Information", 
        description: "Please enter your company name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        email,
        user_type: userType,
        ...(userType === 'field-rep' && { primary_state: primaryState }),
        ...(userType === 'vendor' && {
          company_name: companyName,
          company_website: companyWebsite || null,
          states_covered: statesCovered
        })
      };

      const { error } = await supabase
        .from('pre_launch_signups')
        .insert([signupData]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Email Already Registered",
            description: "This email address is already on our waiting list.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        setEmailCount(prev => prev + 1);
        toast({
          title: "Success!",
          description: "You've been added to our launch notification list."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!email || !userType) return false;
    if (userType === 'field-rep' && !primaryState) return false;
    if (userType === 'vendor' && !companyName) return false;
    return true;
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Verified Professional Network",
      description: "Connect with trusted field reps and vendors through our reputation-based scoring system."
    },
    {
      icon: <MapPin className="h-8 w-8 text-accent" />,
      title: "Smart Coverage Mapping",
      description: "Visualize and manage coverage areas across all 50 states with county-level precision."
    },
    {
      icon: <Star className="h-8 w-8 text-trust" />,
      title: "Credit-Based Economy",
      description: "Earn credits through community participation and use them to unlock premium opportunities."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-secondary" />,
      title: "Industry Community",
      description: "Share knowledge, ask questions, and stay updated with industry-specific discussions."
    }
  ];

  const benefits = {
    fieldRep: [
      "Get discovered by quality vendors seeking coverage",
      "Build your professional reputation with verified reviews",
      "Access exclusive job opportunities in your coverage areas",
      "Communicate with all your vendors in one private message",
      "Connect with industry peers and share knowledge"
    ],
    vendor: [
      "Find reliable field reps in any county nationwide", 
      "Verify credentials and track performance history",
      "Communicate with all field reps regardless of platform used",
      "Manage your coverage network efficiently",
      "Post opportunities to qualified professionals only"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ClearMarket</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Clock className="h-3 w-3 mr-1" />
                Coming Soon
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            🚀 Currently in Development
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The Professional Network for 
            <span className="text-primary block">Field Inspections</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            ClearMarket connects field representatives with vendors through a trusted, 
            credit-based platform designed specifically for the field inspection industry.
          </p>

          <div className="flex items-center justify-center space-x-6 mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">50</div>
              <div className="text-sm text-muted-foreground">States Covered</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">3,143</div>
              <div className="text-sm text-muted-foreground">Counties Mapped</div>
            </div>
          </div>

          {/* Email Signup Form */}
          {!isSubmitted ? (
            <Card className="max-w-2xl mx-auto p-8 shadow-elevated">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                Be First to Know When We Launch
              </h3>
              
              <div className="space-y-4">
                {/* User Type Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={userType === 'field-rep' ? 'default' : 'outline'}
                    className="p-6 h-auto flex-col space-y-2"
                    onClick={() => setUserType('field-rep')}
                  >
                    <UserCheck className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">I'm a Field Rep</div>
                      <div className="text-sm opacity-75">Looking for work opportunities</div>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={userType === 'vendor' ? 'default' : 'outline'}
                    className="p-6 h-auto flex-col space-y-2"
                    onClick={() => setUserType('vendor')}
                  >
                    <Building className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">I'm a Vendor</div>
                      <div className="text-sm opacity-75">Seeking field coverage</div>
                    </div>
                  </Button>
                </div>
                
                {/* Email Input */}
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your professional email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-3"
                    required
                  />
                </div>

                {/* Field Rep Specific Fields */}
                {userType === 'field-rep' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primary-state" className="text-sm font-medium">
                        Primary State *
                      </Label>
                      <Select value={primaryState} onValueChange={setPrimaryState}>
                        <SelectTrigger id="primary-state" className="mt-1">
                          <SelectValue placeholder="Select your primary state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.code} value={state.code}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Vendor Specific Fields */}
                {userType === 'vendor' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-name" className="text-sm font-medium">
                        Company Name *
                      </Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter your company name"
                        className="mt-1 p-3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-website" className="text-sm font-medium">
                        Company Website <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <Input
                        id="company-website"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="mt-1 p-3"
                      />
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleSubmit}
                    className="w-full py-3"
                    disabled={!isFormValid() || isLoading}
                  >
                    {isLoading ? 'Adding you to the list...' : 'Notify Me When We Launch'}
                    {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Get exclusive early access and help shape the platform with your feedback.
              </p>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto p-8 shadow-elevated bg-accent/10 border-accent/20">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-accent mb-2">
                  You're on the list!
                </h3>
                <p className="text-accent/80 mb-4">
                  We'll notify you as soon as ClearMarket launches. Thanks for your interest!
                </p>
                <Badge className="bg-accent/20 text-accent">
                  Position #{emailCount} to join
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Built for the Industry, By the Industry
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed specifically for field inspection professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-elevated transition-shadow">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Screenshots */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              See ClearMarket in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              Preview the tools that will transform how you work
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Field Rep Network Alert Screenshot */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <Badge className="bg-primary/10 text-primary mb-4">For Field Reps</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Broadcast Updates to Your Entire Network
                </h3>
                <p className="text-muted-foreground mb-6">
                  Send one message to all your vendors instead of individual calls, texts, and emails.
                </p>
              </div>
              
              {/* Network Alert Mockup */}
              <div className="bg-background rounded-lg shadow-elevated p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Network Alert</h4>
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">To:</label>
                    <div className="bg-primary/10 p-3 rounded border">
                      <div className="flex items-center text-sm text-primary">
                        <Users className="h-4 w-4 mr-2" />
                        All Network Vendors (12 contacts)
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Subject:</label>
                    <div className="bg-muted p-3 rounded border text-sm">
                      Travel Schedule Update - Multi-County Coverage
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Message:</label>
                    <div className="bg-muted p-3 rounded border text-sm leading-relaxed">
                      Good morning everyone,<br/><br/>
                      Travel update for this week:<br/><br/>
                      TODAY: Starting in Kane County at 9 AM - have 4 REO inspections scheduled. 
                      Will be driving through DuPage County around 2 PM if anyone has urgent same-day needs.<br/><br/>
                      TOMORROW: Heading to Will County first thing - completely open schedule and can take on 3-4 assignments. 
                      Also available for any overflow work in Cook County on my drive back.<br/><br/>
                      As always, reports uploaded same day and photos geotagged.<br/><br/>
                      Thanks,<br/>
                      Mike Johnson
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      ✓ All vendors will receive via their preferred method
                    </div>
                    <Button size="sm" className="bg-primary">
                      Send to Network
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Coverage Search Screenshot */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <Badge className="bg-secondary/10 text-secondary mb-4">For Vendors</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Find Coverage Anywhere in the US
                </h3>
                <p className="text-muted-foreground mb-6">
                  Search by county, zip code, or state to find qualified field reps with verified coverage.
                </p>
              </div>
              
              {/* Coverage Search Mockup */}
              <div className="bg-background rounded-lg shadow-elevated p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Coverage Search</h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    Illinois
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input placeholder="Search counties or zip codes..." className="flex-1" />
                    <Button size="sm" variant="outline">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Button variant="outline" size="sm" className="justify-start">Cook County (47 reps)</Button>
                    <Button variant="outline" size="sm" className="justify-start">DuPage County (23 reps)</Button>
                    <Button variant="outline" size="sm" className="justify-start">Lake County (18 reps)</Button>
                    <Button variant="outline" size="sm" className="justify-start">Will County (31 reps)</Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-foreground mb-3">Cook County Field Reps</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                            MJ
                          </div>
                          <div>
                            <div className="font-medium text-sm">Mike Johnson</div>
                            <div className="text-xs text-muted-foreground">Trust Score: 94 • 127 reviews</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">Available</Badge>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-semibold">
                            AR
                          </div>
                          <div>
                            <div className="font-medium text-sm">Amanda Rodriguez</div>
                            <div className="text-xs text-muted-foreground">Trust Score: 89 • 203 reviews</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">Available</Badge>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                    <Button size="sm" className="bg-secondary">
                      Request Coverage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What's In It For You?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Field Rep Benefits */}
            <Card className="p-8 hover:shadow-elevated transition-shadow">
              <div className="flex items-center mb-6">
                <UserCheck className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold text-foreground">For Field Representatives</h3>
              </div>
              <ul className="space-y-4">
                {benefits.fieldRep.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Vendor Benefits */}
            <Card className="p-8 hover:shadow-elevated transition-shadow">
              <div className="flex items-center mb-6">
                <Building className="h-8 w-8 text-secondary mr-3" />
                <h3 className="text-2xl font-semibold text-foreground">For Vendors</h3>
              </div>
              <ul className="space-y-4">
                {benefits.vendor.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Development Roadmap */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Building Something Great Takes Time
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80">
            We're creating a platform that truly serves the field inspection community. 
            Your input helps us build exactly what you need.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gather Feedback</h3>
              <p className="text-primary-foreground/80 text-sm">Understanding what the community needs most</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Beta Launch</h3>
              <p className="text-primary-foreground/80 text-sm">Early access for founding members</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Platform</h3>
              <p className="text-primary-foreground/80 text-sm">Complete marketplace with all features</p>
            </div>
          </div>

          <Card className="bg-background text-foreground p-8">
            <h3 className="text-xl font-semibold mb-4">Want to Influence Development?</h3>
            <p className="text-muted-foreground mb-6">
              Join our feedback group and help shape ClearMarket's features, pricing, and user experience.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Mail className="h-4 w-4 mr-2" />
              Join Feedback Group
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">ClearMarket</span>
            </div>
            <p className="text-muted-foreground mb-4">
              The professional marketplace for field inspection services
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 ClearMarket. All rights reserved. | 
              <a href="mailto:hello@useclearmarket.io" className="text-primary hover:underline ml-1">
                hello@useclearmarket.io
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

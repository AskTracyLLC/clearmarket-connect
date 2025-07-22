import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';
import { AlertTriangle, FileText, Scroll, PenTool, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNDAStatus } from '@/hooks/useNDAStatus';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BetaNDA = () => {
  const { user } = useAuth();
  const { hasSignedNDA, signNDA, loading: ndaLoading } = useNDAStatus();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [anonymousUsername, setAnonymousUsername] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch user's display name and details for auto-fill
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('display_name, anonymous_username')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        const displayName = data?.display_name || data?.anonymous_username || 'User';
        setUserDisplayName(displayName);
        setAnonymousUsername(data?.anonymous_username || '');
        setUserEmail(user.email || '');
        setSignature(displayName); // Auto-fill signature field
      } catch (err) {
        console.error('Error fetching user details:', err);
        setUserDisplayName('User');
        setUserEmail(user?.email || '');
        setSignature('User');
      }
    };

    fetchUserDetails();
  }, [user]);

  // Redirect if already signed
  useEffect(() => {
    if (!ndaLoading && hasSignedNDA) {
      const redirectTo = location.state?.from || '/fieldrep/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [hasSignedNDA, ndaLoading, navigate, location.state]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !ndaLoading) {
      navigate('/auth', { replace: true });
    }
  }, [user, ndaLoading, navigate]);

  // Scroll detection to enable the agree button
  const handleScroll = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      // Get the viewport div inside ScrollArea - try multiple selectors
      let viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      if (!viewport) {
        viewport = scrollArea.querySelector('.h-full.w-full.rounded-\\[inherit\\]');
      }
      if (!viewport) {
        // Fallback: use the scrollArea itself
        viewport = scrollArea;
      }
      
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px tolerance
        console.log('Scroll detection:', { 
          scrollTop, 
          scrollHeight, 
          clientHeight, 
          isAtBottom, 
          hasScrolledToBottom,
          selector: viewport === scrollArea ? 'fallback' : 'viewport'
        });
        if (isAtBottom && !hasScrolledToBottom) {
          console.log('Setting hasScrolledToBottom to true');
          setHasScrolledToBottom(true);
        }
      } else {
        console.log('No viewport found');
      }
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      // Get the viewport div inside ScrollArea
      let viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      if (!viewport) {
        viewport = scrollArea.querySelector('.h-full.w-full.rounded-\\[inherit\\]');
      }
      if (!viewport) {
        viewport = scrollArea;
      }
      
      if (viewport) {
        viewport.addEventListener('scroll', handleScroll);
        // Also check initial state in case content is already short enough
        setTimeout(handleScroll, 200); // Increased delay
        return () => viewport.removeEventListener('scroll', handleScroll);
      } else {
        console.log('No viewport found during setup - enabling checkbox');
        // Fallback: enable immediately if scroll detection fails
        setTimeout(() => setHasScrolledToBottom(true), 1000);
      }
    }
  }, []);

  // Signature validation
  const validateSignature = (value: string): string[] => {
    const errors: string[] = [];
    
    if (value.length < 6) {
      errors.push('Signature must be at least 6 characters long');
    }
    
    if (value.length > 0 && /^(.)\1*$/.test(value)) {
      errors.push('Signature cannot contain only repeated characters');
    }
    
    if (!/^[a-zA-Z\s]+$/.test(value) && value.length > 0) {
      errors.push('Signature should only contain letters and spaces');
    }
    
    return errors;
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignature(value);
    setErrors(validateSignature(value));
  };

  const canSubmit = hasScrolledToBottom && hasAgreed && signature.length >= 6 && errors.length === 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      await signNDA(signature);
      
      toast({
        title: "NDA Successfully Signed",
        description: "Welcome to ClearMarket Beta! You now have full access to the platform.",
      });
      
      // Redirect to the intended destination or dashboard
      const redirectTo = location.state?.from || '/fieldrep/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Error signing NDA:', error);
      toast({
        title: "Error Signing NDA",
        description: error instanceof Error ? error.message : "Failed to sign NDA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state while checking NDA status
  if (ndaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Checking Agreement Status...</h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we verify your legal agreement status.
          </p>
        </Card>
      </div>
    );
  }

  // Show success state if already signed (shouldn't normally see this due to redirect)
  if (hasSignedNDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Agreement Already Signed</h2>
          <p className="text-muted-foreground text-sm">
            You have already signed the Beta Tester Agreement. Redirecting to platform...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ClearMarketLogo size={64} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Beta Tester Agreement</h1>
          <p className="text-muted-foreground">Required step before accessing ClearMarket Beta</p>
          {userDisplayName && (
            <p className="text-sm text-muted-foreground mt-2">
              Welcome, <span className="font-medium text-foreground">{userDisplayName}</span>
            </p>
          )}
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Legal Agreement
            </Badge>
            <div className="h-px bg-border flex-1 max-w-20"></div>
            <Badge variant="outline" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Digital Signature
            </Badge>
          </div>
        </div>

        <Card className="p-8">
          {/* User Information Form */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Agreement Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anonymousUsername">Username</Label>
                <Input
                  id="anonymousUsername"
                  value={anonymousUsername}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          {/* NDA Content */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Scroll className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Non-Disclosure Agreement</h2>
            </div>
            
            {!hasScrolledToBottom && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please scroll through the entire document to continue. The "I Agree" button will become available once you reach the bottom.
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea 
              className="h-96 w-full border rounded-md p-6 bg-muted/20"
              ref={scrollAreaRef}
            >
              <div className="prose prose-slate max-w-none dark:prose-invert space-y-6">
                  <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-4">ClearMarket Beta Tester Non-Disclosure Agreement</h1>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Effective Date:</strong> {getCurrentDate()}</p>
                      <p><strong>Beta Tester:</strong> {firstName || lastName ? `${firstName} ${lastName}`.trim() : '[To be completed above]'}</p>
                      <p><strong>Email:</strong> {userEmail || '[Email not available]'}</p>
                      <p><strong>Username:</strong> {anonymousUsername || '[Username not available]'}</p>
                      <p><strong>Company/Organization:</strong> [If Applicable]</p>
                    </div>
                  </div>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Agreement Overview</h2>
                  <p className="text-foreground leading-relaxed">
                    Thank you for your interest in participating as a beta tester for <strong>ClearMarket</strong>, a professional networking platform connecting field representatives and vendors in the property inspection industry. This Non-Disclosure Agreement ("NDA") protects confidential information you may access during the beta testing period.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Confidential Information Definition</h2>
                  <p className="text-foreground mb-3"><strong>"Confidential Information"</strong> includes, but is not limited to:</p>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Platform Features & Functionality</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Dual scoring system (Trust Score and Community Score algorithms)</li>
                        <li>Credit economy mechanics and earning/spending formulas</li>
                        <li>Coverage mapping system and county-based geographic data</li>
                        <li>Community engagement features and interaction systems</li>
                        <li>User interface designs, workflows, and user experience elements</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Business & Technical Information</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Business model, pricing strategies, and monetization plans</li>
                        <li>Database architecture, technical specifications, and system design</li>
                        <li>Vendor and field representative matching algorithms</li>
                        <li>Performance metrics, analytics, and reporting capabilities</li>
                        <li>Integration methods with third-party services</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">User & Market Data</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>User profiles, behavior patterns, and engagement statistics</li>
                        <li>Market research, competitive analysis, and industry insights</li>
                        <li>Beta testing feedback, survey results, and improvement plans</li>
                        <li>Financial projections, investment information, and growth strategies</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Non-Disclosure Obligations</h2>
                  <p className="text-foreground mb-3">As a Beta Tester, you agree to:</p>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Maintain Strict Confidentiality</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li><strong>Not disclose</strong> any Confidential Information to third parties</li>
                        <li><strong>Not discuss</strong> platform features on social media, forums, or industry groups</li>
                        <li><strong>Limit access</strong> to authorized personnel only (if testing on behalf of organization)</li>
                        <li><strong>Secure storage</strong> of any materials, screenshots, or documentation provided</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Professional Use Only</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Use Confidential Information <strong>solely for beta testing purposes</strong></li>
                        <li>Provide honest feedback to improve the platform</li>
                        <li>Report bugs, issues, and suggestions through official channels only</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Non-Replication and Non-Compete</h2>
                  <p className="text-foreground mb-3">You expressly agree <strong>NOT</strong> to:</p>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Create Competing Solutions</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Develop, fund, or participate in creating similar platforms</li>
                        <li>Replicate ClearMarket's unique features, especially:
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li>Dual scoring methodology</li>
                            <li>Credit-based economy system</li>
                            <li>Industry-specific networking approach</li>
                            <li>Coverage area mapping functionality</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Reverse Engineering</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Attempt to discover underlying algorithms or technical implementations</li>
                        <li>Extract, copy, or reproduce proprietary code or design elements</li>
                        <li>Use insights gained to benefit competing platforms or services</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Protection & Privacy</h2>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">User Information</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Respect privacy of all platform users encountered during testing</li>
                        <li>Do not contact users outside the platform without explicit consent</li>
                        <li>Report any potential privacy or security concerns immediately</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Screen Captures & Documentation</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Obtain written permission before taking screenshots or recordings</li>
                        <li>Do not share visual materials outside authorized testing team</li>
                        <li>Delete all materials upon completion of beta testing period</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Beta Testing Responsibilities</h2>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Expected Conduct</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Provide constructive, honest feedback</li>
                        <li>Test features thoroughly and report issues promptly</li>
                        <li>Participate in surveys, interviews, or feedback sessions as requested</li>
                        <li>Maintain professional communication standards</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Prohibited Activities</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Attempting to exploit system vulnerabilities</li>
                        <li>Creating fake accounts or manipulating scoring systems</li>
                        <li>Sharing login credentials or unauthorized access</li>
                        <li>Using platform for non-testing business activities</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Term and Termination</h2>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Duration</h3>
                      <p className="text-foreground">This agreement remains in effect from the start of beta testing through:</p>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4 mt-2">
                        <li>Official platform launch, OR</li>
                        <li>Termination of your beta testing participation, OR</li>
                        <li>Written notice from ClearMarket</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Post-Termination Obligations</h3>
                      <p className="text-foreground">Confidentiality obligations continue <strong>indefinitely</strong> after beta testing ends.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Legal Protections</h2>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Intellectual Property</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>All platform concepts, features, and innovations remain ClearMarket's exclusive property</li>
                        <li>No rights or licenses are granted to beta testers</li>
                        <li>Feedback provided becomes ClearMarket's property for improvement purposes</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Enforcement</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                        <li>Violation may result in immediate termination from beta program</li>
                        <li>ClearMarket reserves right to seek legal remedies for breaches</li>
                        <li>Beta tester responsible for any damages resulting from unauthorized disclosure</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Agreement Acceptance</h2>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Digital Signature</h3>
                      <p className="text-foreground">By signing below (digitally or electronically), you acknowledge that you have:</p>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4 mt-2">
                        <li>Read and understood all terms of this agreement</li>
                        <li>Agree to be legally bound by these obligations</li>
                        <li>Confirm your authority to enter into this agreement</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Contact Information</h3>
                      <p className="text-foreground">For questions about this agreement or beta testing program:</p>
                      <ul className="list-disc list-inside space-y-1 text-foreground ml-4 mt-2">
                        <li><strong>Email:</strong> beta@useclearmarket.io</li>
                        <li><strong>Platform:</strong> ClearMarket Beta Testing Portal</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-3">Beta Tester Signature</h2>
                  
                  <div className="max-w-md">
                    <div className="space-y-2 text-sm text-foreground">
                      <p><strong>Name:</strong> {firstName || lastName ? `${firstName} ${lastName}`.trim() : '[To be completed above]'}</p>
                      <p><strong>Signature:</strong> [To be completed below]</p>
                      <p><strong>Date:</strong> {getCurrentDate()}</p>
                    </div>
                  </div>
                </section>

                <section className="border-t pt-6">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm text-foreground font-medium mb-2">
                      <strong>Important Notice:</strong> This agreement is legally binding. Please review carefully and contact us with any questions before signing. Your participation in beta testing constitutes acceptance of these terms.
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      This NDA is governed by Delaware state law and any disputes will be resolved in Delaware courts.
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </div>

          {/* Agreement and Signature Section */}
          <div className="space-y-6">
            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agree"
                checked={hasAgreed}
                onCheckedChange={(checked) => setHasAgreed(checked === true)}
                disabled={!hasScrolledToBottom}
                className="mt-1"
              />
              <label
                htmlFor="agree"
                className={`text-sm leading-relaxed ${
                  hasScrolledToBottom ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                I have read and agree to the Beta Tester Non-Disclosure Agreement. I understand that this is a legally binding document and I am authorized to enter into this agreement.
              </label>
            </div>

            {/* Signature Field */}
            <div className="space-y-3">
              <label htmlFor="signature" className="text-sm font-medium text-foreground">
                Digital Signature <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Your signature: <span className="font-medium text-foreground">{userDisplayName}</span> (from your profile)
              </p>
              <p className="text-xs text-muted-foreground">
                Confirm or edit your full legal name below as your digital signature. This serves as your electronic signature on this agreement.
              </p>
              <Input
                id="signature"
                type="text"
                placeholder="Enter your full legal name"
                value={signature}
                onChange={handleSignatureChange}
                disabled={!hasAgreed}
                className={errors.length > 0 ? 'border-destructive' : ''}
              />
              {errors.length > 0 && (
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-xs text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                size="lg"
                className="min-w-48"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <PenTool className="h-4 w-4 mr-2" />
                    Sign Agreement
                  </>
                )}
              </Button>
            </div>

            {!canSubmit && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {!hasScrolledToBottom && "Please scroll through the entire document first. "}
                  {!hasAgreed && hasScrolledToBottom && "Please check the agreement box. "}
                  {hasAgreed && signature.length < 6 && "Please enter your full legal name (minimum 6 characters)."}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BetaNDA;
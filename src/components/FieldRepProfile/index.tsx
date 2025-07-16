import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileProgress, getFieldRepProfileSteps } from "@/components/ui/progress-indicator";
import BoostEligibilityBadge from "@/components/BoostEligibilityBadge";
import CreditExplainerModal from "@/components/CreditExplainerModal";
import { fieldRepSchema, type FieldRepFormData, type CoverageArea } from "./types";
import { PersonalInfo } from "./PersonalInfo";
import { LocationInfo } from "./LocationInfo";
import { ContactVerification } from "./ContactVerification";
import { BackgroundCheck } from "./BackgroundCheck";
import { CoverageAreas } from "./CoverageAreas";
import { PlatformsUsed } from "./PlatformsUsed";
import { InspectionTypes } from "./InspectionTypes";
import { ProfessionalBio } from "./ProfessionalBio";
import { HudKeys } from "./HudKeys";
import { ClearVueBeta } from "./ClearVueBeta";

const FieldRepProfile = () => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [creditExplainerOpen, setCreditExplainerOpen] = useState(false);
  
  // Track completion status for each tab
  const [tabCompletionStatus, setTabCompletionStatus] = useState({
    personalInfoComplete: false,
    verificationComplete: false,
    coverageSetupComplete: false,
    creditsReviewed: false
  });
  
  // Mock data for demonstration - in real app this would come from database
  const mockUserData = {
    trustScore: 85,
    communityScore: 60,
    creditBalance: 12
  };

  const form = useForm<FieldRepFormData>({
    resolver: zodResolver(fieldRepSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayUsername: profile?.anonymous_username || "",
      phone: "",
      email: "",
      city: "",
      state: "",
      zipCode: "",
      aspenGroveId: "",
      platforms: [],
      otherPlatform: "",
      inspectionTypes: [],
      bio: "",
      hudKeys: [],
      otherHudKey: "",
      clearVueBeta: false,
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile?.anonymous_username) {
      form.setValue('displayUsername', profile.anonymous_username);
    }
  }, [profile, form]);

  // Save handlers for each tab
  const savePersonalInfo = () => {
    const personalFields = ['firstName', 'lastName', 'displayUsername', 'phone', 'email', 'city', 'state', 'zipCode', 'bio'];
    const isComplete = personalFields.every(field => {
      const value = form.getValues(field as keyof FieldRepFormData);
      return value && value.toString().trim() !== '';
    });
    
    if (isComplete) {
      setTabCompletionStatus(prev => ({ ...prev, personalInfoComplete: true }));
      toast({
        title: "Personal Info Saved",
        description: "Your personal information has been saved successfully!",
      });
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill out all required fields in the Personal Info tab.",
        variant: "destructive",
      });
    }
  };

  const saveVerification = () => {
    setTabCompletionStatus(prev => ({ ...prev, verificationComplete: true }));
    toast({
      title: "Verification Saved",
      description: "Your verification information has been saved successfully!",
    });
  };

  const saveCoverageSetup = () => {
    const platforms = form.getValues('platforms');
    const inspectionTypes = form.getValues('inspectionTypes');
    
    if (coverageAreas.length > 0 && platforms.length > 0 && inspectionTypes.length > 0) {
      setTabCompletionStatus(prev => ({ ...prev, coverageSetupComplete: true }));
      toast({
        title: "Coverage Setup Saved",
        description: "Your coverage setup has been saved successfully!",
      });
    } else {
      toast({
        title: "Incomplete Setup",
        description: "Please add coverage areas, select platforms, and choose inspection types.",
        variant: "destructive",
      });
    }
  };

  const saveCredits = () => {
    setTabCompletionStatus(prev => ({ ...prev, creditsReviewed: true }));
    toast({
      title: "Credit Information Reviewed",
      description: "Credit details have been reviewed!",
    });
  };

  const profileSteps = getFieldRepProfileSteps({
    ...tabCompletionStatus,
    networkSize: 0
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ProfileProgress 
        steps={profileSteps} 
        userType="fieldrep" 
        className="max-w-md mx-auto"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Field Rep Profile Setup
          </CardTitle>
          <CardDescription>
            Create your profile to connect with vendors seeking coverage in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="coverage">Coverage Setup</TabsTrigger>
                  <TabsTrigger value="credits">Credits</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 mt-6">
                  <PersonalInfo form={form} />
                  <ContactVerification form={form} />
                  <ProfessionalBio form={form} />
                  <LocationInfo form={form} />
                  
                  <div className="pt-4">
                    <Button 
                      onClick={savePersonalInfo} 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                    >
                      SAVE Personal Info
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-6 mt-6">
                  <BackgroundCheck form={form} />
                  <HudKeys form={form} />
                  <ClearVueBeta form={form} />
                  
                  <div className="pt-4">
                    <Button 
                      onClick={saveVerification} 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                    >
                      SAVE Verification
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="coverage" className="space-y-6 mt-6">
                  <CoverageAreas 
                    coverageAreas={coverageAreas}
                    setCoverageAreas={setCoverageAreas}
                    selectedInspectionTypes={form.watch("inspectionTypes")}
                  />
                  <PlatformsUsed form={form} />
                  <InspectionTypes form={form} />
                  
                  <div className="pt-4">
                    <Button 
                      onClick={saveCoverageSetup} 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                    >
                      SAVE Coverage Setup
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="credits" className="space-y-6 mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Credit Balance: {mockUserData.creditBalance}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCreditExplainerOpen(true)}
                          >
                            How to earn?
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Use credits to unlock vendor contact information and boost your profile visibility
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <BoostEligibilityBadge 
                      trustScore={mockUserData.trustScore}
                      profileComplete={85} 
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={saveCredits} 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                    >
                      SAVE Credit Details
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Form>
        </CardContent>
      </Card>
      
      <CreditExplainerModal 
        open={creditExplainerOpen} 
        onOpenChange={setCreditExplainerOpen} 
      />
    </div>
  );
};

export default FieldRepProfile;
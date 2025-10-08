import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFieldRepProfile } from "@/hooks/useFieldRepProfile";
import { useCoverageAreas } from "@/hooks/useCoverageAreas";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { AspenGroveVerification } from "./AspenGroveVerification";

const FieldRepProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { saveProfile, loading: profileLoading } = useFieldRepProfile();
  const { saveCoverageAreas, fetchCoverageAreas, loading: coverageLoading } = useCoverageAreas();
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [creditExplainerOpen, setCreditExplainerOpen] = useState(false);
  
  const [tabCompletionStatus, setTabCompletionStatus] = useState({
    personalInfoComplete: false,
    verificationComplete: false,
    coverageSetupComplete: false,
    creditsReviewed: false
  });
  const [activeTab, setActiveTab] = useState('personal');
  
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
      aspenGroveExpiration: undefined,
      aspenGroveImage: "",
      platforms: [],
      otherPlatform: "",
      inspectionTypes: [],
      bio: "",
      hudKeys: [],
      otherHudKey: "",
      interestedInBeta: false,
    },
  });

  // Update form when profile loads and fetch NDA data
  useEffect(() => {
    const loadProfileData = async () => {
      if (profile?.anonymous_username) {
        form.setValue('displayUsername', profile.anonymous_username);
      }
      
      // Auto-fill email from auth user
      if (user?.email) {
        form.setValue('email', user.email);
      }
      
      // Fetch NDA signature data to auto-fill first and last name
      if (user?.id) {
        try {
          const { data: ndaData } = await supabase
            .from('nda_signatures')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .order('signed_date', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (ndaData) {
            if (ndaData.first_name) {
              form.setValue('firstName', ndaData.first_name);
            }
            if (ndaData.last_name) {
              form.setValue('lastName', ndaData.last_name);
            }
          }
        } catch (error) {
          console.error('Failed to load NDA data:', error);
        }
      }
    };
    
    loadProfileData();
  }, [profile, user, form]);

  // Load existing coverage areas on component mount
  useEffect(() => {
    const loadCoverageAreas = async () => {
      try {
        const areas = await fetchCoverageAreas();
        setCoverageAreas(areas);
      } catch (error) {
        console.error('Failed to load coverage areas:', error);
      }
    };
    
    loadCoverageAreas();
  }, [fetchCoverageAreas]);

  // Save handlers for each tab
  const savePersonalInfo = async () => {
    // Validate only the fields we require for this section
    const requiredFields: (keyof FieldRepFormData)[] = [
      'firstName','lastName','email','city','state','zipCode','bio'
    ];

    // Ensure phone is not considered required
    form.clearErrors('phone');

    const isValid = await form.trigger(requiredFields as any, { shouldFocus: true });

    if (!isValid) {
      // Collect friendly list of invalid fields
      const errors = form.formState.errors;
      const invalid = requiredFields.filter((f) => !!(errors as any)[f]);
      toast({
        title: 'Incomplete Information',
        description: `Please review: ${invalid.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const values = form.getValues();
      await saveProfile({
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        bio: values.bio,
        interested_in_beta: values.interestedInBeta,
      });

      setTabCompletionStatus((prev) => ({ ...prev, personalInfoComplete: true }));
      toast({
        title: 'Personal Info Saved',
        description: 'Your personal information has been saved successfully!',
      });
      
      // Move to next incomplete tab
      if (!tabCompletionStatus.verificationComplete) {
        setActiveTab('verification');
      } else if (!tabCompletionStatus.coverageSetupComplete) {
        setActiveTab('coverage');
      } else if (!tabCompletionStatus.creditsReviewed) {
        setActiveTab('credits');
      }
    } catch (error: any) {
      console.error('Save personal info error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save personal information. Please try again.';
      toast({
        title: 'Save Failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const saveVerification = async () => {
    // Verification fields are optional - just save whatever user has filled out
    try {
      const values = form.getValues();
      await saveProfile({
        aspen_grove_id: values.aspenGroveId,
        aspen_grove_expiration: values.aspenGroveExpiration,
        aspen_grove_image: values.aspenGroveImage,
        hud_keys: values.hudKeys,
        other_hud_key: values.otherHudKey,
        interested_in_beta: values.interestedInBeta
      });
      
      setTabCompletionStatus(prev => ({ ...prev, verificationComplete: true }));
      toast({
        title: "Verification Saved",
        description: "Your verification information has been saved successfully!",
      });
      
      // Move to next incomplete tab
      if (!tabCompletionStatus.coverageSetupComplete) {
        setActiveTab('coverage');
      } else if (!tabCompletionStatus.creditsReviewed) {
        setActiveTab('credits');
      }
    } catch (error: any) {
      console.error('Save verification error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save verification information. Please try again.';
      toast({
        title: "Save Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const saveCoverageSetup = async () => {
    const values = form.getValues();
    const platforms = values.platforms || [];
    const inspectionTypes = values.inspectionTypes || [];
    
    // Build list of missing requirements
    const missing: string[] = [];
    if (coverageAreas.length === 0) missing.push('at least one coverage area');
    if (platforms.length === 0) missing.push('platforms');
    if (inspectionTypes.length === 0) missing.push('inspection types');
    
    if (missing.length > 0) {
      toast({
        title: "Incomplete Setup",
        description: `Please add: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save both profile data and coverage areas
      await Promise.all([
        saveProfile({
          platforms: platforms,
          other_platform: values.otherPlatform,
          inspection_types: inspectionTypes,
          interested_in_beta: values.interestedInBeta
        }),
        saveCoverageAreas(coverageAreas)
      ]);
      
      setTabCompletionStatus(prev => ({ ...prev, coverageSetupComplete: true }));
      toast({
        title: "Coverage Setup Saved",
        description: "Your coverage setup and pricing have been saved successfully!",
      });
      
      // Move to next incomplete tab
      if (!tabCompletionStatus.creditsReviewed) {
        setActiveTab('credits');
      }
    } catch (error: any) {
      console.error('Save coverage setup error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save coverage setup. Please try again.';
      toast({
        title: "Save Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const saveCredits = async () => {
    // No validation needed - this is just acknowledging they reviewed the credits tab
    try {
      const values = form.getValues();
      await saveProfile({
        interested_in_beta: values.interestedInBeta
      });
      
      setTabCompletionStatus(prev => ({ ...prev, creditsReviewed: true }));
      toast({
        title: "Profile Saved",
        description: "Your profile has been saved successfully!",
      });
    } catch (error: any) {
      console.error('Save credits error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save profile. Please try again.';
      toast({
        title: "Save Failed", 
        description: msg,
        variant: "destructive",
      });
    }
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <AspenGroveVerification form={form} />
                  <BackgroundCheck form={form} />
                  <HudKeys form={form} />
                  
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
                        <CardTitle>
                          Credit Balance: {mockUserData.creditBalance}
                        </CardTitle>
                        <CardDescription>
                          Use credits to unlock vendor contact information and boost your profile visibility
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">How to Earn Credits:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Mark posts as "Helpful"</span>
                              <span className="text-primary">+1 credit/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Receive "Helpful" votes</span>
                              <span className="text-primary">+1 credit each</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Leave vendor reviews</span>
                              <span className="text-primary">+1 credit each</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Complete profile (100%)</span>
                              <span className="text-primary">+5 credits</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly active participation</span>
                              <span className="text-primary">+5 credits</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="font-semibold text-sm">Credit Usage:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Unlock contact details</span>
                              <span className="text-destructive">-2 credits</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Boost profile visibility</span>
                              <span className="text-destructive">-5 credits</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <BoostEligibilityBadge 
                      trustScore={mockUserData.trustScore}
                      profileComplete={85} 
                    />
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
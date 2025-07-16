import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
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
import { DisplayIdentity } from "./DisplayIdentity";
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

  const onSubmit = (data: FieldRepFormData) => {
    if (coverageAreas.length === 0) {
      toast({
        title: "Missing Coverage Areas",
        description: "Please add at least one coverage area with pricing.",
        variant: "destructive",
      });
      return;
    }

    console.log("Field Rep Profile Data:", { ...data, coverageAreas });
    toast({
      title: "Profile Created",
      description: "Your Field Rep profile has been successfully created!",
    });
  };

  const profileSteps = getFieldRepProfileSteps({
    coverageAreas: coverageAreas,
    platforms: form.watch("platforms"),
    inspectionTypes: form.watch("inspectionTypes"),
    backgroundCheckComplete: false,
    networkSize: 0
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ProfileProgress 
        steps={profileSteps} 
        userType="fieldrep" 
        className="max-w-md mx-auto"
      />
      
      {/* Credit and Boost Information */}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <PersonalInfo form={form} />
              <LocationInfo form={form} />
              <ContactVerification form={form} />
              <DisplayIdentity form={form} />
              <CoverageAreas 
                coverageAreas={coverageAreas}
                setCoverageAreas={setCoverageAreas}
              />
              <PlatformsUsed form={form} />
              <InspectionTypes form={form} />
              <ProfessionalBio form={form} />
              <BackgroundCheck form={form} />
              <HudKeys form={form} />
              <ClearVueBeta form={form} />

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Create Field Rep Profile
                </Button>
              </div>
            </form>
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
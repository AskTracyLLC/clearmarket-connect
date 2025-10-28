import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
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
import { fieldRepSchema, type FieldRepFormData, type CoverageArea } from "./types";
import { PersonalInfo } from "./PersonalInfo";
import { LocationInfo } from "./LocationInfo";
import { ContactVerification } from "./ContactVerification";
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
  const { saveProfile: saveProfileToDb, fetchProfile, loading: profileLoading } = useFieldRepProfile();
  const { saveCoverageAreas, fetchCoverageAreas, loading: coverageLoading } = useCoverageAreas();
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCoverage, setIsSavingCoverage] = useState(false);
  
  const [profileCompletionStatus, setProfileCompletionStatus] = useState({
    personalInfoComplete: false,
    verificationComplete: false,
    coverageSetupComplete: false
  });

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
  // Combined effect to load all profile data and calculate completion
  useEffect(() => {
    const loadAllProfileData = async () => {
      if (profile?.anonymous_username) {
        form.setValue('displayUsername', profile.anonymous_username);
      }
      
      // Auto-fill email from auth user
      if (user?.email) {
        form.setValue('email', user.email);
      }
      
      // Fetch saved field rep profile data from database
      if (user?.id) {
        try {
          const [savedProfile, areas] = await Promise.all([
            fetchProfile(),
            fetchCoverageAreas()
          ]);
          
          if (savedProfile) {
            // Populate all saved fields
            if (savedProfile.first_name) form.setValue('firstName', savedProfile.first_name);
            if (savedProfile.last_name) form.setValue('lastName', savedProfile.last_name);
            if (savedProfile.phone) form.setValue('phone', savedProfile.phone);
            if (savedProfile.city) form.setValue('city', savedProfile.city);
            if (savedProfile.state) form.setValue('state', savedProfile.state);
            if (savedProfile.zip_code) form.setValue('zipCode', savedProfile.zip_code);
            if (savedProfile.bio) form.setValue('bio', savedProfile.bio);
            if (typeof savedProfile.hasAspenGrove === 'boolean') form.setValue('hasAspenGrove', savedProfile.hasAspenGrove);
            if (savedProfile.aspen_grove_id) form.setValue('aspenGroveId', savedProfile.aspen_grove_id);
            if (savedProfile.aspen_grove_expiration) form.setValue('aspenGroveExpiration', savedProfile.aspen_grove_expiration);
            if (savedProfile.aspen_grove_image) form.setValue('aspenGroveImage', savedProfile.aspen_grove_image);
            if (savedProfile.platforms) form.setValue('platforms', savedProfile.platforms);
            if (savedProfile.other_platform) form.setValue('otherPlatform', savedProfile.other_platform);
            if (savedProfile.inspection_types) form.setValue('inspectionTypes', savedProfile.inspection_types);
            if (typeof savedProfile.hasHudKeys === 'boolean') form.setValue('hasHudKeys', savedProfile.hasHudKeys);
            if (savedProfile.hud_keys) form.setValue('hudKeys', savedProfile.hud_keys);
            if (savedProfile.other_hud_key) form.setValue('otherHudKey', savedProfile.other_hud_key);
            if (typeof savedProfile.interested_in_beta === 'boolean') {
              form.setValue('interestedInBeta', savedProfile.interested_in_beta);
            }

            // Set coverage areas
            setCoverageAreas(areas);

            // Calculate completion status for all sections
            const personalInfoComplete = Boolean(
              savedProfile.first_name && 
              savedProfile.last_name && 
              savedProfile.city && 
              savedProfile.state && 
              savedProfile.zip_code && 
              savedProfile.bio
            );

            const verificationComplete = Boolean(
              // AspenGrove is complete if: answered "no" OR (answered "yes" AND has ID)
              (savedProfile.hasAspenGrove === false || (savedProfile.hasAspenGrove === true && savedProfile.aspen_grove_id)) ||
              // HUD Keys is complete if: answered "no" OR (answered "yes" AND has keys)
              (savedProfile.hasHudKeys === false || (savedProfile.hasHudKeys === true && savedProfile.hud_keys?.length))
            );

            const coverageSetupComplete = Boolean(
              areas.length > 0 &&
              savedProfile.platforms?.length &&
              savedProfile.inspection_types?.length
            );

            // Update all completion status at once
            setProfileCompletionStatus({
              personalInfoComplete,
              verificationComplete,
              coverageSetupComplete
            });
          } else {
            // If no saved profile, try to load from NDA signature
            const { data: ndaData } = await supabase
              .from('nda_signatures')
              .select('first_name, last_name')
              .eq('user_id', user.id)
              .order('signed_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (ndaData) {
              if (ndaData.first_name) form.setValue('firstName', ndaData.first_name);
              if (ndaData.last_name) form.setValue('lastName', ndaData.last_name);
            }
          }
        } catch (error) {
          console.error('Failed to load profile data:', error);
        }
      }
    };
    
    loadAllProfileData();
  }, [profile, user, form, fetchProfile, fetchCoverageAreas]);


  // Save profile data only (excluding coverage areas)
  const handleSaveProfile = async () => {
    if (isSaving) return;
    
    // Validate all required personal info fields
    const requiredFields: (keyof FieldRepFormData)[] = [
      'firstName','lastName','email','city','state','zipCode','bio'
    ];

    form.clearErrors('phone');
    const isValid = await form.trigger(requiredFields as any, { shouldFocus: true });

    if (!isValid) {
      const errors = form.formState.errors;
      const invalid = requiredFields.filter((f) => !!(errors as any)[f]);
      toast({
        title: 'Incomplete Information',
        description: `Please complete all required fields: ${invalid.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const values = form.getValues();
    setIsSaving(true);
    
    // Add timeout protection (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Save operation timed out. Please check your internet connection and try again.')), 30000);
    });
    
    try {
      // Save profile data with timeout protection (NO coverage areas)
      await Promise.race([
        saveProfileToDb({
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          city: values.city,
          state: values.state,
          zip_code: values.zipCode,
          bio: values.bio,
          hasAspenGrove: values.hasAspenGrove,
          aspen_grove_id: values.aspenGroveId,
          aspen_grove_expiration: values.aspenGroveExpiration,
          aspen_grove_image: values.aspenGroveImage,
          hasHudKeys: values.hasHudKeys,
          hud_keys: values.hudKeys,
          other_hud_key: values.otherHudKey,
          platforms: values.platforms,
          other_platform: values.otherPlatform,
          inspection_types: values.inspectionTypes,
          interested_in_beta: values.interestedInBeta,
        }),
        timeoutPromise
      ]);

      // Update personal info and verification completion
      setProfileCompletionStatus(prev => ({
        ...prev,
        personalInfoComplete: true,
        verificationComplete: true,
      }));
      
      toast({
        title: 'Profile Saved',
        description: 'Your personal information has been saved successfully!',
      });
    } catch (error: any) {
      console.error('Save profile error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save. Please check your connection and try again.';
      toast({
        title: 'Save Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save coverage areas separately (manual action)
  const handleSaveCoverageAreas = async () => {
    if (isSavingCoverage) return;

    // Validate coverage areas, platforms, and inspection types
    const values = form.getValues();
    const missing: string[] = [];
    if (coverageAreas.length === 0) missing.push('at least one coverage area');
    if (!values.platforms?.length) missing.push('platforms');
    if (!values.inspectionTypes?.length) missing.push('inspection types');
    
    if (missing.length > 0) {
      toast({
        title: "Incomplete Coverage Setup",
        description: `Please add: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSavingCoverage(true);
    
    // Add timeout protection (60 seconds for bulk operation)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Coverage save timed out. This is a large operation, please try again.')), 60000);
    });
    
    try {
      // Save coverage areas with timeout protection
      await Promise.race([
        saveCoverageAreas(coverageAreas),
        timeoutPromise
      ]);

      // Update coverage setup completion
      setProfileCompletionStatus(prev => ({
        ...prev,
        coverageSetupComplete: true,
      }));
      
      toast({
        title: 'Coverage Areas Saved',
        description: 'Your coverage areas have been saved successfully!',
      });
    } catch (error: any) {
      console.error('Save coverage error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save coverage areas. Please try again.';
      toast({
        title: 'Coverage Save Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSavingCoverage(false);
    }
  };

  const profileSteps = getFieldRepProfileSteps({
    ...profileCompletionStatus,
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
            <div className="space-y-8">
              {/* Section 1: Personal Information */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">Basic information about yourself</p>
                </div>
                <Separator />
                <PersonalInfo form={form} />
                <ContactVerification form={form} />
                <ProfessionalBio form={form} />
                <LocationInfo form={form} />
              </div>

              {/* Section 2: Verification & Credentials */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Verification & Credentials</h2>
                  <p className="text-sm text-muted-foreground">Optional credentials that can help you stand out</p>
                </div>
                <Separator />
                <AspenGroveVerification form={form} />
                <HudKeys form={form} />
              </div>

              {/* Section 3: Coverage & Services */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Coverage & Services</h2>
                  <p className="text-sm text-muted-foreground">Where you work and what services you provide</p>
                </div>
                <Separator />
                <CoverageAreas 
                  coverageAreas={coverageAreas}
                  setCoverageAreas={setCoverageAreas}
                  selectedInspectionTypes={form.watch("inspectionTypes")}
                  onSaveCoverageAreas={async (areas) => {
                    await saveCoverageAreas(areas);
                  }}
                />
                <PlatformsUsed form={form} />
                <InspectionTypes form={form} />
                
                {/* Coverage Areas Save Button - Separate from profile save */}
                <div className="rounded-lg border border-muted bg-card p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">Save Coverage Areas</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        ⏱️ This may take 30-60 seconds depending on the number of counties selected. 
                        Your profile data will be saved separately.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveCoverageAreas} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={isSavingCoverage}
                  >
                    {isSavingCoverage ? 'Saving Coverage Areas...' : 'SAVE COVERAGE AREAS'}
                  </Button>
                </div>
              </div>

              {/* Profile Save Button */}
              <div className="pt-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t -mx-6 px-6 py-4">
                <Button 
                  onClick={handleSaveProfile} 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving Profile...' : 'SAVE PROFILE'}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldRepProfile;
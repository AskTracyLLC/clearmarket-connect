import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
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
  const loadedRef = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-save form to localStorage
  useEffect(() => {
    if (!user?.id) return;
    
    const subscription = form.watch((data) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        localStorage.setItem(`fieldrep_draft_${user.id}`, JSON.stringify(data));
      }, 1000);
    });
    
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [user?.id, form]);

  // Update form when profile loads and fetch NDA data
  // Combined effect to load all profile data and calculate completion
  useEffect(() => {
    if (!user?.id) return; // wait until user is available
    
    let cancelled = false;
    loadedRef.current = false; // Reset on user change

    const loadAllProfileData = async () => {
      if (loadedRef.current) return; // Prevent duplicate loads within same mount
      loadedRef.current = true;

      if (profile?.anonymous_username) {
        form.setValue('displayUsername', profile.anonymous_username);
      }
      
      // Auto-fill email from auth user
      if (user?.email) {
        form.setValue('email', user.email);
      }
      
      // Check for localStorage draft first
      const draftKey = `fieldrep_draft_${user.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      try {
        const [savedProfile, areas] = await Promise.all([
          fetchProfile(),
          fetchCoverageAreas()
        ]);
        
        if (cancelled) return;
        
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
        } else if (savedDraft) {
          // Load from localStorage draft if no DB profile
          try {
            const draft = JSON.parse(savedDraft);
            Object.entries(draft).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                form.setValue(key as any, value as any);
              }
            });
            toast({
              title: "Draft Restored",
              description: "Your unsaved changes have been restored.",
            });
          } catch (e) {
            console.error("Failed to parse draft:", e);
          }
        } else {
          // If no saved profile, try to load from NDA signature
          const { data: ndaData } = await supabase
            .from('nda_signatures')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .order('signed_date', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (cancelled) return;
          
          if (ndaData) {
            if (ndaData.first_name) form.setValue('firstName', ndaData.first_name);
            if (ndaData.last_name) form.setValue('lastName', ndaData.last_name);
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };
    
    loadAllProfileData();
    
    return () => { 
      cancelled = true;
    };
  }, [user?.id, profile?.anonymous_username]);


  // Save personal info section
  const handleSavePersonalInfo = async () => {
    if (isSaving) return;
    
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
    
    try {
      await saveProfileToDb({
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        bio: values.bio,
        interested_in_beta: values.interestedInBeta,
      });

      if (user?.id) {
        localStorage.removeItem(`fieldrep_draft_${user.id}`);
      }

      setProfileCompletionStatus(prev => ({
        ...prev,
        personalInfoComplete: true,
      }));
      
      toast({
        title: 'Saved',
        description: 'Personal information saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error?.message || 'Failed to save. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save verification section
  const handleSaveVerification = async () => {
    if (isSaving) return;

    const values = form.getValues();
    setIsSaving(true);
    
    try {
      await saveProfileToDb({
        hasAspenGrove: values.hasAspenGrove,
        aspen_grove_id: values.aspenGroveId,
        aspen_grove_expiration: values.aspenGroveExpiration,
        aspen_grove_image: values.aspenGroveImage,
        hasHudKeys: values.hasHudKeys,
        hud_keys: values.hudKeys,
        other_hud_key: values.otherHudKey,
      });

      setProfileCompletionStatus(prev => ({
        ...prev,
        verificationComplete: true,
      }));
      
      toast({
        title: 'Saved',
        description: 'Verification credentials saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error?.message || 'Failed to save. Please try again.',
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
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="coverage">Services & Coverage</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Form {...form}>
                <div className="space-y-8">
                  {/* Section 1: Personal Information */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div>
                        <CardTitle className="text-xl">Personal Information</CardTitle>
                        <CardDescription>Basic information about yourself</CardDescription>
                      </div>
                      <Button 
                        onClick={handleSavePersonalInfo} 
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <PersonalInfo form={form} />
                      <ContactVerification form={form} />
                      <ProfessionalBio form={form} />
                      <LocationInfo form={form} />
                    </CardContent>
                  </Card>

                  {/* Section 2: Verification & Credentials */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div>
                        <CardTitle className="text-xl">Verification & Credentials</CardTitle>
                        <CardDescription>Optional credentials that can help you stand out</CardDescription>
                      </div>
                      <Button 
                        onClick={handleSaveVerification} 
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <AspenGroveVerification form={form} />
                      <HudKeys form={form} />
                    </CardContent>
                  </Card>
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="coverage" className="mt-6">
              <Form {...form}>
                <div className="space-y-8">
                  {/* Platforms */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div>
                        <CardTitle className="text-xl">Platforms Used</CardTitle>
                        <CardDescription>Software platforms you're experienced with</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PlatformsUsed form={form} />
                    </CardContent>
                  </Card>

                  {/* Inspection Types */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div>
                        <CardTitle className="text-xl">Inspection Types</CardTitle>
                        <CardDescription>Types of inspections you perform</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <InspectionTypes form={form} />
                    </CardContent>
                  </Card>

                  {/* Coverage Areas & Pricing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Coverage Areas & Pricing</CardTitle>
                      <CardDescription>Where you work and your pricing for each area</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CoverageAreas 
                        coverageAreas={coverageAreas}
                        setCoverageAreas={setCoverageAreas}
                        selectedInspectionTypes={form.watch("inspectionTypes")}
                        fieldRepName={`${form.watch("firstName")} ${form.watch("lastName")}`.trim() || profile?.display_name || profile?.anonymous_username}
                        onSaveCoverageAreas={async (areas) => {
                          await saveCoverageAreas(areas);
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldRepProfile;
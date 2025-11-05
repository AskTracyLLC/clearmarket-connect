import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProfileProgress, getVendorProfileSteps } from "@/components/ui/progress-indicator";
import { vendorFormSchema, VendorFormData, CoverageArea } from "./types";
import { VendorBasicInfo } from "./VendorBasicInfo";
import { VendorCoverageAreas } from "./VendorCoverageAreas";
import { VendorWorkTypes } from "./VendorWorkTypes";
import { VendorPlatforms } from "./VendorPlatforms";
import { VendorCompanyBio } from "./VendorCompanyBio";
import { VendorAdditionalInfo } from "./VendorAdditionalInfo";
import VendorNetworkTab from "./VendorNetworkTab";
import VendorReferralTab from "./VendorReferralTab";
import VendorStaffTab from "./VendorStaffTab";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useNetworkConnections } from "@/hooks/useNetworkConnections";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const VendorProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveProfile, fetchProfile, loading: profileLoading } = useVendorProfile();
  const { connections } = useNetworkConnections();
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      companyName: "",
      companyAbbreviation: "",
      phone: "",
      email: "",
      website: "",
      workTypes: [],
      platforms: [],
      otherPlatform: "",
      companyBio: "",
      avgJobs: "",
      paymentTerms: "",
    },
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        if (profile) {
          if (profile.company_name) form.setValue('companyName', profile.company_name);
          if (profile.company_abbreviation) form.setValue('companyAbbreviation', profile.company_abbreviation);
          if (profile.phone) form.setValue('phone', profile.phone);
          if (profile.email) form.setValue('email', profile.email);
          if (profile.website) form.setValue('website', profile.website);
          if (profile.company_bio) form.setValue('companyBio', profile.company_bio);
          if (profile.work_types) form.setValue('workTypes', profile.work_types);
          if (profile.platforms) form.setValue('platforms', profile.platforms);
          if (profile.other_platform) form.setValue('otherPlatform', profile.other_platform);
          if (profile.avg_jobs_per_month) form.setValue('avgJobs', profile.avg_jobs_per_month);
          if (profile.payment_terms) form.setValue('paymentTerms', profile.payment_terms);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const onSubmit = async (values: VendorFormData) => {
    if (isSaving) return;
    
    // Check for coverage areas first
    if (coverageAreas.length === 0) {
      toast({
        title: "No Coverage Areas",
        description: "Please add at least one coverage area before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({
        company_name: values.companyName,
        company_abbreviation: values.companyAbbreviation,
        phone: values.phone,
        email: values.email,
        website: values.website,
        company_bio: values.companyBio,
        work_types: values.workTypes,
        platforms: values.platforms,
        other_platform: values.otherPlatform,
        avg_jobs_per_month: values.avgJobs,
        payment_terms: values.paymentTerms,
      });
      
      toast({
        title: "Profile Saved",
        description: "Your vendor profile has been saved successfully!",
      });
    } catch (error: any) {
      console.error('Save vendor profile error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save vendor profile. Please try again.';
      toast({
        title: "Save Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const profileSteps = getVendorProfileSteps({
    serviceAreas: coverageAreas,
    platforms: form.watch("platforms"),
    workTypes: form.watch("workTypes"),
    networkSize: connections.length
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ProfileProgress 
        steps={profileSteps} 
        userType="vendor" 
        className="max-w-md mx-auto"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Vendor Dashboard
          </CardTitle>
          <CardDescription>
            Manage your company profile and network connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Company Profile</TabsTrigger>
              <TabsTrigger value="coverage">Services & Coverage</TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                My Network 
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {connections.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="referrals">
                Referrals
              </TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Section 1: Company Information */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Company Information</h2>
                      <p className="text-sm text-muted-foreground">Basic details about your company</p>
                    </div>
                    <Separator />
                    <VendorBasicInfo form={form} />
                    <VendorCompanyBio form={form} />
                  </div>

                  {/* Section 2: Additional Information */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Additional Information</h2>
                      <p className="text-sm text-muted-foreground">Job volume and payment details</p>
                    </div>
                    <Separator />
                    <VendorAdditionalInfo form={form} />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t -mx-6 px-6 py-4">
                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSaving}>
                      {isSaving ? 'SAVING PROFILE...' : 'SAVE PROFILE'}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="coverage" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Platforms */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Platforms Used</h2>
                      <p className="text-sm text-muted-foreground">Software platforms you use</p>
                    </div>
                    <Separator />
                    <VendorPlatforms form={form} />
                  </div>

                  {/* Work Types */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Work Types</h2>
                      <p className="text-sm text-muted-foreground">Types of work you need coverage for</p>
                    </div>
                    <Separator />
                    <VendorWorkTypes form={form} />
                  </div>

                  {/* Service Coverage */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Service Coverage Areas</h2>
                      <p className="text-sm text-muted-foreground">Areas where you need field rep coverage</p>
                    </div>
                    <Separator />
                    <VendorCoverageAreas 
                      coverageAreas={coverageAreas} 
                      setCoverageAreas={setCoverageAreas} 
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t -mx-6 px-6 py-4">
                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSaving}>
                      {isSaving ? 'SAVING COVERAGE...' : 'SAVE COVERAGE'}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="network" className="mt-6">
              <VendorNetworkTab />
            </TabsContent>
            
            <TabsContent value="referrals" className="mt-6">
              <VendorReferralTab />
            </TabsContent>
            
            <TabsContent value="staff" className="mt-6">
              <VendorStaffTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;
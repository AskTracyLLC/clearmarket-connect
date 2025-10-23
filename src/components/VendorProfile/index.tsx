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
import { mockCurrentVendor } from "@/data/mockVendorData";

const VendorProfile = () => {
  const { toast } = useToast();
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);

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

  const onSubmit = async (values: VendorFormData) => {
    // Check for coverage areas first
    if (coverageAreas.length === 0) {
      toast({
        title: "No Coverage Areas",
        description: "Please add at least one coverage area before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Form submitted:", { ...values, coverageAreas });
      toast({
        title: "Profile Created",
        description: "Your vendor profile has been created successfully!",
      });
    } catch (error: any) {
      console.error('Save vendor profile error:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to save vendor profile. Please try again.';
      toast({
        title: "Save Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const profileSteps = getVendorProfileSteps({
    serviceAreas: coverageAreas,
    platforms: form.watch("platforms"),
    workTypes: form.watch("workTypes"),
    networkSize: mockCurrentVendor.network.length
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Company Profile</TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                My Network 
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {mockCurrentVendor.network.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                Referrals 
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {mockCurrentVendor.referrals.filter(ref => ref.creditEarned).length}
                </span>
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

                  {/* Section 2: Service Coverage */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Service Coverage</h2>
                      <p className="text-sm text-muted-foreground">Areas where you need field rep coverage</p>
                    </div>
                    <Separator />
                    <VendorCoverageAreas 
                      coverageAreas={coverageAreas} 
                      setCoverageAreas={setCoverageAreas} 
                    />
                  </div>

                  {/* Section 3: Work Details */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Work Details</h2>
                      <p className="text-sm text-muted-foreground">Services you need and platforms you use</p>
                    </div>
                    <Separator />
                    <VendorWorkTypes form={form} />
                    <VendorPlatforms form={form} />
                  </div>

                  {/* Section 4: Additional Information */}
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
                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      SAVE PROFILE
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
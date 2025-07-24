import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
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

  const onSubmit = (values: VendorFormData) => {
    if (coverageAreas.length === 0) {
      toast({
        title: "No Coverage Areas",
        description: "Please add at least one coverage area before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log("Form submitted:", { ...values, coverageAreas });
    toast({
      title: "Profile Created",
      description: "Your vendor profile has been created successfully!",
    });
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <VendorBasicInfo form={form} />
                  <VendorCoverageAreas 
                    coverageAreas={coverageAreas} 
                    setCoverageAreas={setCoverageAreas} 
                  />
                  <VendorWorkTypes form={form} />
                  <VendorPlatforms form={form} />
                  <VendorCompanyBio form={form} />
                  <VendorAdditionalInfo form={form} />

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      Save Profile Changes
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
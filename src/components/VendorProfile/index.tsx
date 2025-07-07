import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { vendorFormSchema, VendorFormData, CoverageArea } from "./types";
import { VendorBasicInfo } from "./VendorBasicInfo";
import { VendorCoverageAreas } from "./VendorCoverageAreas";
import { VendorWorkTypes } from "./VendorWorkTypes";
import { VendorPlatforms } from "./VendorPlatforms";
import { VendorCompanyBio } from "./VendorCompanyBio";
import { VendorAdditionalInfo } from "./VendorAdditionalInfo";

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Vendor Profile Setup
          </CardTitle>
          <CardDescription>
            Create your company profile to find reliable field reps in your coverage areas
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  Create Vendor Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;
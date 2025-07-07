import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fieldRepSchema, type FieldRepFormData, type CoverageArea } from "./types";
import { PersonalInfo } from "./PersonalInfo";
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
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);

  const form = useForm<FieldRepFormData>({
    resolver: zodResolver(fieldRepSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayUsername: "",
      phone: "",
      email: "",
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

  return (
    <div className="max-w-4xl mx-auto p-6">
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
    </div>
  );
};

export default FieldRepProfile;
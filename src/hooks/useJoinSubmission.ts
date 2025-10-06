import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SignupType = "prelaunch" | "field-rep-direct" | "vendor-direct" | "beta-register";

export interface JoinResult {
  anonymous_username: string;
  user_type: "field_rep" | "vendor";
  email: string;
  temp_password?: string;
  token?: string;
  signupType: SignupType;
}

export interface PrelaunchData {
  email: string;
  userType: "field_rep" | "vendor";
  name?: string;
  state?: string;
  experience?: string;
  workTypes?: string[];
  betaTesting?: boolean;
  interestedFeatures?: string;
}

export interface FieldRepDirectData extends Omit<PrelaunchData, "userType"> {}
export interface VendorDirectData extends Omit<PrelaunchData, "userType"> {
  companyName?: string;
  website?: string;
}

function generateTempPassword(): string {
  const base = Math.random().toString(36).slice(-6);
  return `Cm!${base}9A`;
}

export const useJoinSubmission = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [generatedUsername, setGeneratedUsername] = useState<string>("");
  const [userType, setUserType] = useState<"field_rep" | "vendor">("field_rep");

  const sendAsyncEmail = async (payload: {
    signupType: "field_rep" | "vendor";
    email: string;
    anonymous_username: string;
    registration_link?: string;
    beta_tester?: boolean;
  }) => {
    try {
      await supabase.functions.invoke("send-signup-email", {
        body: {
          signupType: payload.signupType,
          email: payload.email,
          anonymous_username: payload.anonymous_username,
          beta_tester: payload.beta_tester ?? false,
          registration_link: payload.registration_link || "#",
        },
      });
    } catch (_) {
      // Silently ignore to avoid UX degradation; delivery will be retried manually if needed
    }
  };

  const submitPrelaunchSignup = async (formData: PrelaunchData): Promise<JoinResult> => {
    const insertData = {
      email: formData.email,
      user_type: formData.userType,
      primary_state: formData.state || null,
      experience_level: formData.experience || null,
      work_type: (formData.workTypes || []),
      current_challenges: null as string | null,
      interested_features: formData.interestedFeatures ? [formData.interestedFeatures] : null,
      interested_in_beta_testing: !!formData.betaTesting,
      anonymous_username: null as string | null,
    };

    const { data, error } = await supabase
      .from("pre_launch_signups")
      .insert(insertData)
      .select("anonymous_username, user_type, email")
      .maybeSingle();

    if (error) throw error as Error;

    const anon = data?.anonymous_username || "User#0";
    const utype = (data?.user_type as "field_rep" | "vendor") || formData.userType;

    return {
      anonymous_username: anon,
      user_type: utype,
      email: formData.email,
      signupType: "prelaunch",
    };
  };

  const submitFieldRepSignup = async (formData: FieldRepDirectData): Promise<JoinResult> => {
    // Fallback to prelaunch table to keep types consistent
    return submitPrelaunchSignup({
      ...formData,
      userType: "field_rep",
    });
  };

  const submitVendorSignup = async (formData: VendorDirectData): Promise<JoinResult> => {
    // Fallback to prelaunch table to keep types consistent
    return submitPrelaunchSignup({
      ...formData,
      userType: "vendor",
    });
  };

  const handleJoinClick = async (
    formData: PrelaunchData | FieldRepDirectData | VendorDirectData,
    signupType: SignupType = "prelaunch"
  ): Promise<JoinResult> => {
    setIsSubmitting(true);
    try {
      let result: JoinResult;

      switch (signupType) {
        case "field-rep-direct":
          result = await submitFieldRepSignup(formData as FieldRepDirectData);
          break;
        case "vendor-direct":
          result = await submitVendorSignup(formData as VendorDirectData);
          break;
        case "beta-register":
          // Beta registration is handled on a dedicated page; fall back to prelaunch data model
          result = await submitPrelaunchSignup(formData as PrelaunchData);
          break;
        case "prelaunch":
        default:
          result = await submitPrelaunchSignup(formData as PrelaunchData);
      }

      setGeneratedUsername(result.anonymous_username);
      setUserType(result.user_type);
      setShowSuccessModal(true);

      // Background tasks: token + email (non-blocking)
      setTimeout(async () => {
        try {
          const tempPassword = generateTempPassword();
          const { data: token, error: tokenError } = await supabase.rpc(
            "generate_beta_registration_token",
            {
              user_email: result.email,
              user_type_param: result.user_type,
              username: result.anonymous_username,
            }
          );

          if (!tokenError && token) {
            await supabase
              .from("beta_registration_tokens")
              .update({ temp_password: tempPassword })
              .eq("token", token as string);

            await sendAsyncEmail({
              signupType: result.user_type,
              email: result.email,
              anonymous_username: result.anonymous_username,
              registration_link: `${window.location.origin}/beta-register?token=${token}`,
              beta_tester: true,
            });
          } else {
            await sendAsyncEmail({
              signupType: result.user_type,
              email: result.email,
              anonymous_username: result.anonymous_username,
              beta_tester: true,
            });
          }
        } catch (_) {
          // ignore background errors
        }
      }, 50);

      toast({
        title: "You're on the list!",
        description: `Welcome ${result.anonymous_username}. We'll email next steps shortly.`,
      });

      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleJoinClick,
    isSubmitting,
    showSuccessModal,
    setShowSuccessModal,
    generatedUsername,
    userType,
  };
};

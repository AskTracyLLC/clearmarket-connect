import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useJoinSubmission, SignupType, PrelaunchData, FieldRepDirectData, VendorDirectData } from "@/hooks/useJoinSubmission";

interface UniversalJoinButtonProps {
  formData: PrelaunchData | FieldRepDirectData | VendorDirectData;
  signupType?: SignupType;
  buttonText?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xl";
}

export const UniversalJoinButton: React.FC<UniversalJoinButtonProps> = ({
  formData,
  signupType = "prelaunch",
  buttonText = "Join ClearMarket",
  className = "w-full",
  size = "lg",
}) => {
  const { handleJoinClick, isSubmitting } = useJoinSubmission();

  return (
    <Button
      onClick={() => handleJoinClick(formData, signupType)}
      disabled={isSubmitting}
      className={className}
      size={size}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining ClearMarket...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default UniversalJoinButton;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * @deprecated This component is deprecated. Direct users to /auth?tab=signup instead.
 * Kept for backwards compatibility with legacy code.
 */
interface UniversalJoinButtonProps {
  buttonText?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xl";
  // Legacy props - ignored
  formData?: any;
  signupType?: any;
}

export const UniversalJoinButton: React.FC<UniversalJoinButtonProps> = ({
  buttonText = "Join ClearMarket",
  className = "w-full",
  size = "lg",
}) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/auth?tab=signup')}
      className={className}
      size={size}
    >
      {buttonText}
    </Button>
  );
};

export default UniversalJoinButton;

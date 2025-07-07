import { Badge } from "@/components/ui/badge";
import { Shield, Star, CheckCircle, Crown } from "lucide-react";
import { UserBadge as UserBadgeType } from "@/data/mockCommunityPosts";

interface UserBadgeProps {
  badge: UserBadgeType;
  size?: "sm" | "md";
}

const UserBadge = ({ badge, size = "sm" }: UserBadgeProps) => {
  const getIcon = () => {
    const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    
    switch (badge.type) {
      case "top-contributor":
        return <Crown className={iconSize} />;
      case "helpful-commenter":
        return <Star className={iconSize} />;
      case "verified":
        return <CheckCircle className={iconSize} />;
      case "moderator":
        return <Shield className={iconSize} />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (badge.color) {
      case "primary":
        return "default";
      case "success":
        return "secondary";
      case "warning":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={`gap-1 ${size === "sm" ? "text-xs" : "text-sm"} flex items-center`}
    >
      {getIcon()}
      {badge.label}
    </Badge>
  );
};

export default UserBadge;
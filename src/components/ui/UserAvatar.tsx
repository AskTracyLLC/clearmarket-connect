import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import TrustScoreBadge from "@/components/TrustScore/TrustScoreBadge";

interface UserAvatarProps {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: 'field_rep' | 'vendor' | 'moderator' | 'admin';
  companyLogo?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  trustScore?: {
    overall_trust_score: number;
    badge_level: string;
  };
  showTrustBadge?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  firstName,
  lastName,
  role,
  companyLogo,
  size = 'md',
  className,
  trustScore,
  showTrustBadge = false
}) => {
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    return 'U'; // Default fallback
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const showCompanyLogo = role === 'vendor' && companyLogo;

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        {showCompanyLogo && (
          <AvatarImage 
            src={companyLogo} 
            alt="Company logo" 
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {showTrustBadge && trustScore && (role === 'field_rep' || role === 'vendor') && (
        <div className="absolute -bottom-1 -right-1">
          <TrustScoreBadge
            badgeLevel={trustScore.badge_level}
            score={trustScore.overall_trust_score}
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
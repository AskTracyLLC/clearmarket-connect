import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Award, Crown, Gem } from "lucide-react";

interface TrustScoreBadgeProps {
  badgeLevel: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  badgeLevel,
  score,
  size = 'md',
  showScore = false
}) => {
  const getBadgeInfo = (level: string) => {
    switch (level) {
      case 'verified_pro':
        return { 
          label: 'Verified Pro', 
          icon: Gem, 
          color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
          textColor: 'text-white',
          borderColor: 'border-purple-300'
        };
      case 'trusted':
        return { 
          label: 'Trusted', 
          icon: Crown, 
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500', 
          textColor: 'text-white',
          borderColor: 'border-yellow-300'
        };
      case 'reputable':
        return { 
          label: 'Reputable', 
          icon: Award, 
          color: 'bg-gradient-to-r from-blue-500 to-blue-600', 
          textColor: 'text-white',
          borderColor: 'border-blue-300'
        };
      case 'reliable':
        return { 
          label: 'Reliable', 
          icon: Shield, 
          color: 'bg-gradient-to-r from-green-500 to-green-600', 
          textColor: 'text-white',
          borderColor: 'border-green-300'
        };
      default:
        return { 
          label: 'Building Trust', 
          icon: Star, 
          color: 'bg-gradient-to-r from-gray-500 to-gray-600', 
          textColor: 'text-white',
          borderColor: 'border-gray-300'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { 
          badge: 'px-2 py-1 text-xs', 
          icon: 'h-3 w-3',
          gap: 'mr-1'
        };
      case 'lg':
        return { 
          badge: 'px-4 py-2 text-base', 
          icon: 'h-5 w-5',
          gap: 'mr-2'
        };
      default:
        return { 
          badge: 'px-3 py-1 text-sm', 
          icon: 'h-4 w-4',
          gap: 'mr-1'
        };
    }
  };

  const badgeInfo = getBadgeInfo(badgeLevel);
  const sizeClasses = getSizeClasses();
  const BadgeIcon = badgeInfo.icon;

  return (
    <Badge 
      className={`
        ${badgeInfo.color} 
        ${badgeInfo.textColor} 
        ${sizeClasses.badge}
        border-0 font-medium
        shadow-sm
      `}
    >
      <BadgeIcon className={`${sizeClasses.icon} ${sizeClasses.gap}`} />
      {badgeInfo.label}
      {showScore && score && (
        <span className="ml-2 opacity-90">
          {Math.round(score)}/100
        </span>
      )}
    </Badge>
  );
};

export default TrustScoreBadge;
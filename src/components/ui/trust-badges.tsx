import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, Star, Shield, Users, Mail } from "lucide-react";

interface TrustBadgeProps {
  type: "verified" | "active" | "top-rated" | "background-check" | "network" | "email-verified";
  className?: string;
}

export const TrustBadge = ({ type, className }: TrustBadgeProps) => {
  const badges = {
    "verified": {
      icon: CheckCircle,
      label: "Verified",
      tooltip: "Profile information has been verified by ClearMarket",
      variant: "default" as const
    },
    "active": {
      icon: Clock,
      label: "Recently Active",
      tooltip: "Active within the last 7 days",
      variant: "secondary" as const
    },
    "top-rated": {
      icon: Star,
      label: "Top Rated",
      tooltip: "Maintains a 4.8+ average rating",
      variant: "default" as const
    },
    "background-check": {
      icon: Shield,
      label: "Background Checked",
      tooltip: "Background check completed and verified",
      variant: "outline" as const
    },
    "network": {
      icon: Users,
      label: "Network Member",
      tooltip: "Active member of the ClearMarket network",
      variant: "secondary" as const
    },
    "email-verified": {
      icon: Mail,
      label: "Email Verified",
      tooltip: "Email address has been verified",
      variant: "outline" as const
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={badge.variant} className={`flex items-center gap-1 ${className}`}>
          <Icon className="h-3 w-3" />
          {badge.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{badge.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface LastActiveProps {
  daysAgo: number;
  className?: string;
}

export const LastActive = ({ daysAgo, className }: LastActiveProps) => {
  const getActivityText = (days: number) => {
    if (days === 0) return "Active now";
    if (days === 1) return "Active yesterday";
    if (days <= 7) return `Active ${days} days ago`;
    if (days <= 30) return `Active ${Math.ceil(days / 7)} weeks ago`;
    return "Last active over a month ago";
  };

  const getActivityColor = (days: number) => {
    if (days <= 1) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <span className={`text-xs ${getActivityColor(daysAgo)} ${className}`}>
      {getActivityText(daysAgo)}
    </span>
  );
};
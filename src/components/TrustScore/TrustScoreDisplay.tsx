import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Shield, Award, Crown, Gem } from "lucide-react";

interface TrustScoreDisplayProps {
  trustScore: {
    communication_score: number;
    overall_trust_score: number;
    badge_level: string;
    total_reviews: number;
    // Field Rep specific
    on_time_performance_score?: number;
    quality_of_work_score?: number;
    // Vendor specific
    paid_on_time_score?: number;
    provided_what_needed_score?: number;
  };
  userRole: 'field_rep' | 'vendor';
  displayName: string;
  compact?: boolean;
}

const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  trustScore,
  userRole,
  displayName,
  compact = false
}) => {
  const getBadgeInfo = (badgeLevel: string) => {
    switch (badgeLevel) {
      case 'verified_pro':
        return { label: 'Verified Pro', icon: Gem, color: 'bg-gradient-to-r from-purple-500 to-pink-500', textColor: 'text-white' };
      case 'trusted':
        return { label: 'Trusted', icon: Crown, color: 'bg-gradient-to-r from-yellow-400 to-orange-500', textColor: 'text-white' };
      case 'reputable':
        return { label: 'Reputable', icon: Award, color: 'bg-gradient-to-r from-blue-500 to-blue-600', textColor: 'text-white' };
      case 'reliable':
        return { label: 'Reliable', icon: Shield, color: 'bg-gradient-to-r from-green-500 to-green-600', textColor: 'text-white' };
      default:
        return { label: 'Building Trust', icon: Star, color: 'bg-gradient-to-r from-gray-500 to-gray-600', textColor: 'text-white' };
    }
  };

  const badgeInfo = getBadgeInfo(trustScore.badge_level);
  const BadgeIcon = badgeInfo.icon;

  const getCategoryLabels = () => {
    if (userRole === 'field_rep') {
      return {
        second: 'On-Time',
        third: 'Quality',
        secondScore: trustScore.on_time_performance_score,
        thirdScore: trustScore.quality_of_work_score
      };
    } else {
      return {
        second: 'Paid On-Time',
        third: 'Provided What Needed',
        secondScore: trustScore.paid_on_time_score,
        thirdScore: trustScore.provided_what_needed_score
      };
    }
  };

  const { second, third, secondScore, thirdScore } = getCategoryLabels();

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {Math.round(trustScore.overall_trust_score)}/100
          </div>
          <div className="text-xs text-muted-foreground">Trust Score</div>
        </div>
        <Badge className={`${badgeInfo.color} ${badgeInfo.textColor} border-0`}>
          <BadgeIcon className="h-3 w-3 mr-1" />
          {badgeInfo.label}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-sm text-muted-foreground">
              Based on {trustScore.total_reviews} review{trustScore.total_reviews !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge className={`${badgeInfo.color} ${badgeInfo.textColor} border-0 px-3 py-1`}>
            <BadgeIcon className="h-4 w-4 mr-2" />
            {badgeInfo.label}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Overall Trust Score */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">
              {Math.round(trustScore.overall_trust_score)}/100
            </div>
            <div className="text-sm text-muted-foreground">Overall Trust Score</div>
          </div>

          {/* Category Scores */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Communication</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={trustScore.communication_score} 
                  className="w-20 h-2" 
                />
                <span className="text-sm font-mono w-8">
                  {Math.round(trustScore.communication_score)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{second}</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={secondScore || 50} 
                  className="w-20 h-2" 
                />
                <span className="text-sm font-mono w-8">
                  {Math.round(secondScore || 50)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{third}</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={thirdScore || 50} 
                  className="w-20 h-2" 
                />
                <span className="text-sm font-mono w-8">
                  {Math.round(thirdScore || 50)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustScoreDisplay;
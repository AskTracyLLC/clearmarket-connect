import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Users, MessageCircle, Shield, CheckCircle, Star } from "lucide-react";

interface GamificationDashboardProps {
  profileCompletionPercent: number;
  communityScore: number;
  badges: string[];
  referralCount: number;
}

const GamificationDashboard = ({
  profileCompletionPercent,
  communityScore,
  badges,
  referralCount
}: GamificationDashboardProps) => {
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Profile Complete": return <CheckCircle className="h-4 w-4" />;
      case "Community Contributor": return <MessageCircle className="h-4 w-4" />;
      case "Verified": return <Shield className="h-4 w-4" />;
      case "Top Referrer": return <Users className="h-4 w-4" />;
      case "Early Adopter": return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Completion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="font-semibold">{profileCompletionPercent}%</span>
            </div>
            <Progress value={profileCompletionPercent} className="h-2" />
            {profileCompletionPercent < 100 && (
              <div className="text-xs text-muted-foreground">
                Complete your profile to unlock 1 free contact credit!
              </div>
            )}
            {profileCompletionPercent === 100 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Profile complete! Credit earned.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Community Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Community Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">{communityScore}</div>
            <div className="text-sm text-muted-foreground">
              Based on helpful votes and contributions
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              View Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="flex items-center gap-2 p-2">
                  {getBadgeIcon(badge)}
                  <span className="text-xs">{badge}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm">
              No badges earned yet. Start by completing your profile!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Referral Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Referrals</span>
              <span className="font-semibold">{referralCount}/10</span>
            </div>
            <Progress value={(referralCount / 10) * 100} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Next reward at {Math.min(referralCount + 1, 10)} referrals
            </div>
            <Button variant="hero" size="sm" className="w-full">
              Invite Friends
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationDashboard;
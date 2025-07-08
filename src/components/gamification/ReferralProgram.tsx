import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Copy, Gift, Share2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralProgramProps {
  userId: string;
  referralStats: {
    invited: number;
    joined: number;
    creditsEarned: number;
  };
}

const ReferralProgram = ({ userId, referralStats }: ReferralProgramProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://clearmarket.app/invite/${userId}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied!",
        description: "Share this link to earn referral rewards.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join ClearMarket",
        text: "Connect with field reps and vendors on ClearMarket!",
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  const getRewardProgress = () => {
    const milestones = [
      { count: 1, reward: "1 Free Contact Unlock" },
      { count: 5, reward: "Community Badge" },
      { count: 10, reward: "Top Referrer Badge" },
    ];
    
    return milestones.map(milestone => ({
      ...milestone,
      achieved: referralStats.joined >= milestone.count
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Refer & Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Share ClearMarket with colleagues and earn rewards when they join!
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Referral Link</label>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="min-w-[80px]"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={shareLink} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{referralStats.invited}</div>
              <div className="text-xs text-muted-foreground">Invited</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{referralStats.joined}</div>
              <div className="text-xs text-muted-foreground">Joined</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{referralStats.creditsEarned}</div>
              <div className="text-xs text-muted-foreground">Credits Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Reward Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getRewardProgress().map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {milestone.count} referral{milestone.count > 1 ? 's' : ''}
                </span>
                <Badge variant={milestone.achieved ? "default" : "outline"}>
                  {milestone.reward}
                </Badge>
              </div>
              <Progress 
                value={Math.min((referralStats.joined / milestone.count) * 100, 100)} 
                className="h-2" 
              />
              {milestone.achieved && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Reward unlocked!
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralProgram;
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LimitStatus {
  remaining: number;
  daily_limit: number;
  is_unlimited: boolean;
  used_today: number;
}

export const ConnectionLimitStatus = () => {
  const { user } = useAuth();
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimitStatus();
  }, [user]);

  const fetchLimitStatus = async () => {
    if (!user) return;

    try {
      // Get today's usage
      const { data: limitData } = await supabase
        .from('daily_connection_request_limits')
        .select('request_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const usedToday = limitData?.request_count || 0;

      // Get user's limit settings
      const { data: userData } = await supabase
        .from('users')
        .select('role, daily_connection_request_limit')
        .eq('id', user.id)
        .single();

      // Get trust score to check for unlimited status
      const { data: trustData } = await supabase
        .from('trust_scores')
        .select('badge_level')
        .eq('user_id', user.id)
        .single();

      let dailyLimit = userData?.daily_connection_request_limit;
      let isUnlimited = false;

      // Check if user has unlimited based on trust badge
      if (trustData?.badge_level === 'trusted' || trustData?.badge_level === 'verified_pro') {
        isUnlimited = true;
      } else if (!dailyLimit) {
        // Default limits based on role
        dailyLimit = userData?.role === 'vendor' ? 5 : 10;
      }

      setLimitStatus({
        remaining: isUnlimited ? -1 : Math.max(0, dailyLimit - usedToday),
        daily_limit: dailyLimit,
        is_unlimited: isUnlimited,
        used_today: usedToday,
      });
    } catch (error) {
      console.error('Error fetching limit status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !limitStatus) {
    return null;
  }

  const isLow = !limitStatus.is_unlimited && limitStatus.remaining <= 2;
  const isOut = !limitStatus.is_unlimited && limitStatus.remaining === 0;

  return (
    <Card className={`${isOut ? 'border-destructive' : isLow ? 'border-orange-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isOut ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Info className="h-5 w-5 text-primary" />
            )}
            <div>
              <h3 className="font-semibold text-sm">Connection Requests</h3>
              <p className="text-xs text-muted-foreground">Daily limit status</p>
            </div>
          </div>
          
          <div className="text-right">
            {limitStatus.is_unlimited ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      ∞ Unlimited
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">You have unlimited connection requests due to your trust badge</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <div className="text-2xl font-bold">
                  {limitStatus.remaining}/{limitStatus.daily_limit}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    isOut 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' 
                      : isLow 
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                  }`}
                >
                  {isOut ? 'Limit Reached' : isLow ? 'Running Low' : 'Remaining Today'}
                </Badge>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used: {limitStatus.used_today} today
            </p>
          </div>
        </div>
        
        {isOut && (
          <p className="text-xs text-destructive mt-3">
            You've reached your daily limit. Try again tomorrow or upgrade your trust score for more requests.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

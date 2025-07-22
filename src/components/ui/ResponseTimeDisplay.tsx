import { Clock, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useResponseTimeTracking } from '@/hooks/useResponseTimeTracking';
import { useCommunicationBadges } from '@/hooks/useCommunicationBadges';

interface ResponseTimeDisplayProps {
  userId: string;
  showBadges?: boolean;
  compact?: boolean;
}

export const ResponseTimeDisplay = ({ 
  userId, 
  showBadges = true, 
  compact = false 
}: ResponseTimeDisplayProps) => {
  const { metrics, loading } = useResponseTimeTracking(userId);
  const { userBadges, getBadgeIcon } = useCommunicationBadges(userId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm">Loading response time...</span>
      </div>
    );
  }

  if (!metrics || metrics.avg_response_minutes === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">No response data yet</span>
      </div>
    );
  }

  const getResponseTimeColor = (minutes: number): string => {
    if (minutes <= 60) return 'text-green-600';
    if (minutes <= 240) return 'text-blue-600';
    if (minutes <= 480) return 'text-yellow-600';
    if (minutes <= 1440) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      if (remainingMins === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
      }
      return `${hours}h ${remainingMins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      if (remainingHours === 0) {
        return `${days} day${days === 1 ? '' : 's'}`;
      }
      return `${days}d ${remainingHours}h`;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className={`text-xs font-medium ${getResponseTimeColor(metrics.avg_response_minutes)}`}>
          {formatTime(metrics.avg_response_minutes)}
        </span>
        {showBadges && userBadges.length > 0 && (
          <div className="flex gap-1">
            {userBadges.slice(0, 2).map((badge) => (
              <span key={badge.id} className="text-xs" title={badge.display_name}>
                {getBadgeIcon(badge.badge_type)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            Typically replies within{' '}
            <span className={getResponseTimeColor(metrics.avg_response_minutes)}>
              {formatTime(metrics.avg_response_minutes)}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            {metrics.response_rate.toFixed(0)}% response rate • {metrics.total_messages_received} messages
          </span>
        </div>
      </div>

      {showBadges && userBadges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {userBadges.map((badge) => (
            <Badge
              key={badge.id}
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: `${badge.badge_color}20`, color: badge.badge_color }}
            >
              <span className="mr-1">{getBadgeIcon(badge.badge_type)}</span>
              {badge.display_name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
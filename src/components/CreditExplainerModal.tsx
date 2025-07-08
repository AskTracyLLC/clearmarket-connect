import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ThumbsUp, 
  Star, 
  Users, 
  AlertTriangle, 
  Camera,
  Lightbulb,
  Mail,
  MessageSquare,
  MapPin,
  TrendingUp,
  Unlock
} from "lucide-react";

interface CreditExplainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreditExplainerModal = ({ open, onOpenChange }: CreditExplainerModalProps) => {
  const earningMethods = [
    {
      icon: CheckCircle,
      action: 'Your post is marked "Helpful" by another user',
      credits: '+1 credit for the first, +0.5 for the second, +0.25 for the third',
      limit: 'Diminishing after 3',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    },
    {
      icon: ThumbsUp,
      action: 'You mark someone else\'s post as "Helpful"',
      credits: '+1 credit',
      limit: 'Max 1 credit/day',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      icon: Star,
      action: 'Leave a review for a Vendor you\'ve worked with',
      credits: '+1 credit',
      limit: 'No limit',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    },
    {
      icon: Star,
      action: 'Leave a review for a Field Rep in your network',
      credits: '+1 credit',
      limit: 'No limit',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    },
    {
      icon: Users,
      action: 'Refer someone who joins and becomes active (joins a Network)',
      credits: '+1 credit',
      limit: 'Spam prevention in place',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    },
    {
      icon: AlertTriangle,
      action: 'Send a Network Alert that vendors mark as "Helpful"',
      credits: '+1 credit (first), +0.5 (second), +0.25 (third)',
      limit: 'Max 3 credits per alert',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    },
    {
      icon: MapPin,
      action: 'Connect to a Rep/Vendor in a new county',
      credits: '+1 credit',
      limit: 'First connection only',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
    },
    {
      icon: Camera,
      action: 'Upload verified work history (admin approved)',
      credits: '+1 credit',
      limit: 'No limit',
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
    },
    {
      icon: Lightbulb,
      action: 'Submit a tip or best practice that\'s approved or rated helpful',
      credits: '+1 credit',
      limit: 'No limit',
      color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
    },
    {
      icon: Mail,
      action: 'Respond to vendor messages within 24 hours (weekly streak)',
      credits: '+1 credit/week',
      limit: 'Ongoing bonus',
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
    },
    {
      icon: CheckCircle,
      action: 'Complete your full profile (100%)',
      credits: '+1 credit',
      limit: 'One-time bonus',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    }
  ];

  const usageOptions = [
    {
      icon: Unlock,
      description: 'Unlock contact details for Vendors or Field Reps',
      color: 'bg-primary text-primary-foreground'
    },
    {
      icon: TrendingUp,
      description: 'Boost your Field Rep profile to the top of local search results',
      note: '(Must meet minimum Trust Score and Community Score to qualify)',
      color: 'bg-secondary text-secondary-foreground'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">🎉 How to Earn Credits on ClearMarket</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <p className="text-muted-foreground">
            Credits help you unlock contact info, boost visibility, and stay active on the platform — 
            all without needing to pay out of pocket. Here's how to earn them:
          </p>

          {/* Earning Methods */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🧠 Earn Credits Through Activity
            </h3>
            
            <div className="space-y-4">
              {earningMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className={`p-2 rounded-lg ${method.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">{method.action}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className="text-green-600">
                          {method.credits}
                        </Badge>
                        <span className="text-muted-foreground">{method.limit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usage Options */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🚀 Use Credits To
            </h3>
            
            <div className="space-y-3">
              {usageOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{option.description}</div>
                      {option.note && (
                        <div className="text-sm text-muted-foreground mt-1">{option.note}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protection System */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🔒 Protecting the System
            </h3>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                "Helpful" votes only count once per user per post
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Daily caps prevent abuse (like toggling votes)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Referrals only count when the user becomes active (joins a Network)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Spam alerts or system misuse may result in credit removal
              </li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Need more help? Visit your Credit Activity section to track how you're earning and spending your credits.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditExplainerModal;
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Unlock,
  Award,
  Shield,
  Clock,
  Target,
  Coins,
  Gift,
  UserCheck,
  Calendar
} from "lucide-react";

interface CreditExplainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreditExplainerModal = ({ open, onOpenChange }: CreditExplainerModalProps) => {
  // Core earning methods (your existing system)
  const coreEarningMethods = [
    {
      icon: CheckCircle,
      action: 'Your post is marked "Helpful" by another user',
      credits: '+1 credit for first, +0.5 second, +0.25 third',
      limit: 'Diminishing returns after 3',
      frequency: 'Per post',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    },
    {
      icon: ThumbsUp,
      action: 'You mark someone else\'s post as "Helpful"',
      credits: '+1 credit',
      limit: 'Max 1 credit/day',
      frequency: 'Daily cap',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      icon: Star,
      action: 'Leave a review for a Vendor you\'ve worked with',
      credits: '+1 credit',
      limit: 'No limit',
      frequency: 'Per review',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    },
    {
      icon: Users,
      action: 'Refer someone who joins and becomes active',
      credits: '+1 credit',
      limit: 'Must join a Network',
      frequency: 'Per active referral',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    },
    {
      icon: AlertTriangle,
      action: 'Send Network Alert marked as "Helpful"',
      credits: '+1, +0.5, +0.25 (diminishing)',
      limit: 'Max 3 credits per alert',
      frequency: 'Per helpful alert',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    },
    {
      icon: Mail,
      action: 'Respond to vendor messages within 24 hours',
      credits: '+1 credit/week',
      limit: 'Weekly streak bonus',
      frequency: 'Ongoing',
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
    }
  ];

  // Profile & achievement bonuses
  const achievementBonuses = [
    {
      icon: CheckCircle,
      action: 'Complete your full profile (100%)',
      credits: '+5 credits',
      limit: 'One-time bonus',
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      icon: Camera,
      action: 'Upload verified work history (admin approved)',
      credits: '+3 credits',
      limit: 'Per approval',
      color: 'bg-teal-100 text-teal-700'
    },
    {
      icon: MapPin,
      action: 'Connect to Rep/Vendor in new county',
      credits: '+2 credits',
      limit: 'First connection only',
      color: 'bg-indigo-100 text-indigo-700'
    },
    {
      icon: Lightbulb,
      action: 'Submit approved tip or best practice',
      credits: '+2 credits',
      limit: 'Must be approved',
      color: 'bg-cyan-100 text-cyan-700'
    },
    {
      icon: Award,
      action: 'Reach 80+ Trust Score',
      credits: '+15 credits',
      limit: 'One-time milestone',
      color: 'bg-gold-100 text-gold-700'
    },
    {
      icon: UserCheck,
      action: 'Reach Bronze/Silver/Gold Community Rank',
      credits: '+5/10/20 credits',
      limit: 'Rank achievement bonus',
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  // Monthly challenges & bonuses
  const monthlyActivities = [
    {
      icon: Calendar,
      action: 'Monthly active member (5+ helpful votes given)',
      credits: '+5 credits',
      limit: 'Monthly bonus',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: MessageSquare,
      action: 'Post 3+ helpful community posts per month',
      credits: '+3 credits',
      limit: 'Monthly challenge',
      color: 'bg-green-100 text-green-700'
    },
    {
      icon: Users,
      action: 'Help 5+ community members per month',
      credits: '+10 credits',
      limit: 'Community hero bonus',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      icon: Star,
      action: 'Maintain 90%+ response rate to vendor messages',
      credits: '+8 credits',
      limit: 'Professional excellence',
      color: 'bg-yellow-100 text-yellow-700'
    }
  ];

  // Usage options
  const usageOptions = [
    {
      icon: Unlock,
      description: 'Unlock contact details for Vendors or Field Reps',
      cost: '2 credits',
      note: 'Per contact unlock',
      color: 'bg-primary text-primary-foreground'
    },
    {
      icon: TrendingUp,
      description: 'Boost your profile to top of local search results',
      cost: '5 credits',
      note: 'Must meet minimum Trust & Community Score',
      color: 'bg-secondary text-secondary-foreground'
    },
    {
      icon: Gift,
      description: 'Access premium opportunities before others',
      cost: '3 credits',
      note: 'Early access to high-value jobs',
      color: 'bg-amber-100 text-amber-700'
    },
    {
      icon: Shield,
      description: 'Priority customer support',
      cost: '1 credit',
      note: 'Fast-track support tickets',
      color: 'bg-green-100 text-green-700'
    },
    {
      icon: Target,
      description: 'Featured vendor spotlight',
      cost: '10 credits',
      note: 'Highlight your services for 7 days',
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  const protectionMeasures = [
    'Helpful votes only count once per user per post',
    'Daily caps prevent abuse and vote manipulation',
    'Referrals only count when user becomes active (joins Network)',
    'Review authenticity verified through work history',
    'Spam alerts or system misuse result in credit removal',
    'Admin approval required for work history uploads',
    'Anti-bot measures and account verification required',
    'Credit transactions are logged and auditable'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            How to Earn Credits on ClearMarket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            Credits help you unlock contact info, boost visibility, and access premium features — 
            all earned through valuable community contributions. Here's your complete guide:
          </p>

          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="core">Core Activities</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Bonuses</TabsTrigger>
              <TabsTrigger value="usage">Spend Credits</TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Daily & Ongoing Activities
              </h3>
              
              <div className="space-y-3">
                {coreEarningMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium">{method.action}</div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            {method.credits}
                          </Badge>
                          <Badge variant="outline">
                            {method.frequency}
                          </Badge>
                          <span className="text-muted-foreground">{method.limit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                One-Time Achievements & Milestones
              </h3>
              
              <div className="space-y-3">
                {achievementBonuses.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${achievement.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium">{achievement.action}</div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <Badge variant="default" className="bg-amber-100 text-amber-700">
                            {achievement.credits}
                          </Badge>
                          <span className="text-muted-foreground">{achievement.limit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Challenges & Bonuses
              </h3>
              
              <div className="space-y-3">
                {monthlyActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${activity.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium">{activity.action}</div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <Badge variant="default" className="bg-blue-100 text-blue-700">
                            {activity.credits}
                          </Badge>
                          <span className="text-muted-foreground">{activity.limit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                How to Spend Your Credits
              </h3>
              
              <div className="space-y-3">
                {usageOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className={`p-2 rounded-lg ${option.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.description}</div>
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <Badge variant="destructive">
                            {option.cost}
                          </Badge>
                          <span className="text-muted-foreground">{option.note}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Protection System */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Protection & Fair Play
            </h3>
            
            <div className="grid md:grid-cols-2 gap-2">
              {protectionMeasures.map((measure, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{measure}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Pro Tips for Earning Credits
            </h4>
            <ul className="text-sm space-y-1 ml-6">
              <li>• Be genuinely helpful - quality contributions earn more</li>
              <li>• Complete your profile early for the 5-credit bonus</li>
              <li>• Maintain consistent vendor communication for weekly bonuses</li>
              <li>• Focus on monthly challenges for bigger credit rewards</li>
              <li>• Build your Trust and Community Scores for milestone bonuses</li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Need help tracking your credits? Check your dashboard's Credit Activity section.
            </div>
            <Button onClick={() => onOpenChange(false)}>
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditExplainerModal;
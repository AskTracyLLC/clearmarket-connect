import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageCircle, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <Card className={className}>
    <CardContent className="p-12 text-center">
      <div className="flex flex-col items-center space-y-4">
        {icon && (
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && (
          action.href ? (
            <Button asChild variant="hero">
              <Link to={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} variant="hero">
              {action.label}
            </Button>
          )
        )}
      </div>
    </CardContent>
  </Card>
);

export const SearchEmptyState = ({ zipCode }: { zipCode: string }) => (
  <EmptyState
    icon={<Search className="h-8 w-8 text-muted-foreground" />}
    title="No reps found in this area yet"
    description={`Be the first to join and get noticed! We're always looking for quality field reps in ${zipCode}.`}
    action={{
      label: "Create Rep Profile",
      href: "/fieldrep/profile"
    }}
  />
);

export const CommunityEmptyState = ({ onCreatePost }: { onCreatePost?: () => void }) => (
  <EmptyState
    icon={<MessageCircle className="h-8 w-8 text-muted-foreground" />}
    title="Looks quiet here..."
    description="Want to be the first to start the conversation? Share your insights, ask questions, or help fellow professionals."
    action={{
      label: "Start a Topic",
      onClick: onCreatePost
    }}
  />
);

export const NetworkEmptyState = () => (
  <EmptyState
    icon={<Users className="h-8 w-8 text-muted-foreground" />}
    title="Your network is just getting started"
    description="Connect with field reps and vendors to build your professional network. Start by searching for coverage in your area."
    action={{
      label: "Find Coverage",
      href: "/vendor/search"
    }}
  />
);

export const ReferralsEmptyState = () => (
  <EmptyState
    icon={<Plus className="h-8 w-8 text-muted-foreground" />}
    title="No referrals yet"
    description="Start earning by referring quality field reps to the ClearMarket network. Each successful referral earns you credits."
    action={{
      label: "Send First Referral",
      onClick: () => {} // This would open the referral modal
    }}
  />
);
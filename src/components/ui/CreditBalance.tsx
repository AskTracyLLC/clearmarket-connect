import { Coins, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";

const CreditBalance = () => {
  const { credits, loading } = useUserCredits();
  const { profile } = useUserProfile();

  const getCreditPath = () => {
    const role = profile?.role || "field_rep";
    return role === "vendor" ? "/vendor/dashboard?tab=billing" : "/fieldrep/dashboard?tab=billing";
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild className="flex items-center gap-1 hover:bg-muted">
        <Link to={getCreditPath()}>
          <Star className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {credits?.rep_points ?? 0}
          </span>
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className="flex items-center gap-1 hover:bg-muted">
        <Link to={getCreditPath()}>
          <Coins className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">
            {credits?.current_balance ?? 0}
          </span>
        </Link>
      </Button>
    </div>
  );
};

export default CreditBalance;
import { Coins, Loader2 } from "lucide-react";
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
    <Button variant="ghost" size="sm" asChild className="flex items-center gap-2 hover:bg-muted">
      <Link to={getCreditPath()}>
        <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium">
          {credits?.current_balance ?? 0}
        </span>
      </Link>
    </Button>
  );
};

export default CreditBalance;
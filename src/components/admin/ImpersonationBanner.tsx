import { AlertTriangle, Eye, EyeOff, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImpersonation } from "@/hooks/useImpersonation";
import { cn } from "@/lib/utils";

export const ImpersonationBanner = () => {
  const { 
    isImpersonating, 
    targetUserName, 
    targetUserRole,
    isReadOnly, 
    scopes,
    expiresAt,
    endImpersonation 
  } = useImpersonation();

  if (!isImpersonating) return null;

  const timeRemaining = expiresAt 
    ? Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000))
    : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[hsl(var(--trust))] to-[hsl(var(--primary-glow))] text-[hsl(var(--primary-foreground))] shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">Viewing as:</span>
              <Badge variant="secondary" className="bg-[hsl(var(--card))] text-[hsl(var(--trust))]">
                {targetUserName}
              </Badge>
              {targetUserRole && (
                <Badge variant="outline" className="bg-white/20 text-[hsl(var(--primary-foreground))] border-white">
                  {targetUserRole}
                </Badge>
              )}
              <span className="text-sm opacity-90">•</span>
              {isReadOnly ? (
                <div className="flex items-center gap-1.5">
                  <EyeOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Read-only Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Support Mode</span>
                  {scopes.length > 0 && (
                    <span className="text-xs opacity-75">
                      ({scopes.join(', ')})
                    </span>
                  )}
                </div>
              )}
              {timeRemaining > 0 && (
                <>
                  <span className="text-sm opacity-90">•</span>
                  <span className="text-sm opacity-90">
                    Expires in {timeRemaining} min
                  </span>
                </>
              )}
            </div>
          </div>
          
          <Button
            onClick={endImpersonation}
            variant="outline"
            size="sm"
            className="bg-white text-orange-600 hover:bg-orange-50 flex-shrink-0"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit Impersonation
          </Button>
        </div>
      </div>
    </div>
  );
};
